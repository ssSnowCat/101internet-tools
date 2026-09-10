// ==UserScript==
// @name         ЕИССД: Раскрытие дерева (Кнопка в заголовке)
// @namespace    http://tampermonkey.net
// @version      1.7
// @downloadURL  https://raw.githubusercontent.com/ssSnowCat/101internet-tools/main/EISSD_Tree_Expand.user.js
// @updateURL    https://raw.githubusercontent.com/ssSnowCat/101internet-tools/main/EISSD_Tree_Expand.user.js
// @description  Кнопка «Раскрыть дерево» в заголовке «Создание заявки».
// @author       Roman Yakovlev
// @match        https://eissd.rt.ru/order/phys/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isProcessing = false;

    function expandComboTree() {
        if (isProcessing) return;
        isProcessing = true;

        const hitAreas = document.querySelectorAll(
            '.combo-tree .expandable > .hitarea, .treeview .expandable > .hitarea'
        );

        if (hitAreas.length === 0) {
            console.log('[ЕИССД]: Все доступные ветки дерева успешно развернуты.');
            isProcessing = false;
            return;
        }

        hitAreas.forEach(hitArea => {
            hitArea.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });

        setTimeout(() => {
            isProcessing = false;
            expandComboTree();
        }, 400);
    }

    function createHeaderButton() {
        const header = document.querySelector('h1.c-head-36.js-head');
        if (!header) return;

        const oldButton = document.getElementById('eissd-expand-btn-header');

        if (oldButton && oldButton.closest('h1.c-head-36.js-head') === header) return;
        if (oldButton) oldButton.remove();

        const btn = document.createElement('button');
        btn.id = 'eissd-expand-btn-header';
        btn.type = 'button';
        btn.innerText = '🌳 Раскрыть дерево';
        btn.title = 'Раскрыть все доступные ветки дерева';

        Object.assign(btn.style, {
            display: 'inline-flex',
            alignItems: 'center',
            verticalAlign: 'middle',
            position: 'relative',
            zIndex: '2147483647',
            pointerEvents: 'auto',
            marginLeft: '18px',
            padding: '7px 14px',
            background: '#1a73e8',
            color: '#fff',
            border: '0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px',
            lineHeight: '1.2',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 5px rgba(0,0,0,0.20)',
            transition: 'background-color .15s ease, transform .1s ease'
        });

        btn.addEventListener('mouseenter', () => btn.style.background = '#0b57d0');
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#1a73e8';
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('mousedown', () => btn.style.transform = 'scale(.96)');
        btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');

        // Срабатывает в capture-фазе, до обработчиков выпадающих списков ЕИССД.
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            expandComboTree();
        }, true);

        btn.addEventListener('pointerdown', e => e.stopPropagation(), true);
        btn.addEventListener('mousedown', e => e.stopPropagation(), true);

        header.appendChild(btn);
    }

    function init() {
        createHeaderButton();

        const observer = new MutationObserver(() => createHeaderButton());
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
