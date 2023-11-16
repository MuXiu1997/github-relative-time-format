// ==UserScript==
// @name              GitHub Relative Time Format
// @name:zh-CN        GitHub 时间格式化
// @namespace         https://greasyfork.org/zh-CN/scripts/480032-github-relative-time-format
// @version           0.1.0
// @description       replacing GitHub relative timestamps(<relative-time>) with customizable date and time formats
// @description:zh-CN 用自定义的日期时间格式替换 GitHub 时间显示（<relative-time>）
// @author            MuXiu1997 (https://github.com/MuXiu1997)
// @license           MIT
// @homepageURL       https://github.com/MuXiu1997/github-relative-time-format
// @supportURL        https://github.com/MuXiu1997/github-relative-time-format
// @match             https://github.com/**
// @icon              https://www.google.com/s2/favicons?sz=64&domain=github.com
// @require           https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             GM_registerMenuCommand
// @grant             GM_unregisterMenuCommand
// ==/UserScript==

(function () {
    'use strict'

    const DISPLAY_FORMAT = useOption('DISPLAY_FORMAT', 'Change display format', 'YY-MM-DD HH:mm')
    const TOOLTIP_FORMAT = useOption('TOOLTIP_FORMAT', 'Change tooltip format', 'YYYY-MM-DD HH:mm:ss')

    function replaceRelativeTimeText() {
        const relativeTimeElements = document.getElementsByTagName("relative-time")
        for (const e of relativeTimeElements) {
            const datetimeStr = e.getAttribute("datetime")
            const dateObj = dayjs(datetimeStr)
            e.title = dateObj.format(TOOLTIP_FORMAT.value)
            e.shadowRoot.innerHTML = dateObj.format(DISPLAY_FORMAT.value)
        }
    }

    replaceRelativeTimeText()

    /**
     * @type {MutationObserver}
     */
    let observer

    const setupObserve = () => {
        observer?.observe(
            document.querySelector('body'),
            {
                childList: true,
                subtree: true,
                attributes: true,
            },
        )
    }
    const debounceReplaceRelativeTimeText = debounce(
        () => {
            observer?.disconnect()
            replaceRelativeTimeText()
            setupObserve()
        },
        50
    )
    observer = new MutationObserver(debounceReplaceRelativeTimeText)
    setupObserve()


    /**
     * Create UI for the options
     * The following code is based on the work of the original author Anthony Fu, and the original code can be found at https://github.com/antfu/refined-github-notifications/blob/main/index.js
     * The copyright of the original code belongs to John Doe and is released under the MIT license
     * Any modifications follow the terms of the MIT license
     * @template T
     * @param {string} key
     * @param {string} title
     * @param {T} defaultValue
     * @returns {{ value: T }}
     */
    function useOption(key, title, defaultValue) {
        if (typeof GM_getValue === 'undefined') {
            return {
                value: defaultValue,
            }
        }

        let value = GM_getValue(key, defaultValue)
        const ref = {
            get value() {
                return value
            },
            set value(v) {
                value = v
                GM_setValue(key, v)
                location.reload()
            },
        }

        GM_registerMenuCommand(title, () => {
            const newValue = prompt(title, value)
            if (newValue != null) ref.value = newValue
        })

        return ref
    }

    /**
     * @param {Function} fn
     * @param {number} wait
     * @returns {Function}
     */
    function debounce(fn, wait) {
        let timeout

        return function (...args) {
            const later = () => {
                clearTimeout(timeout)
                fn.apply(this, args)
            }

            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }
})()
