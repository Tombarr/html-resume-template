"use strict";
/**
 * Simple script to make text elements on the page editable,
 * and to save and restore the page across page loads.
 * 
 * Note: if running on the file:// protocol, some browsers may
 * disable access to localStorage.
 */
(function() {
    var VERSION = 1.2;

    var USE_CONTENTEDITABLE = !('designMode' in document);

    // Source https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    function htmlToElement(html) {
        var documentFragment = document.createDocumentFragment();
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        for (var i = 0, e = template.content.childNodes.length; i < e; i++) {
            documentFragment.appendChild(template.content.childNodes[i].cloneNode(true));
        }
        return documentFragment;
    }

    function supportsLocalStorage() {
        if (!('localStorage' in window)) return false;
        try {
            localStorage.setItem('test', 'true');
            localStorage.getItem('test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    function supportsTemplate() {
        return ('content' in document.createElement('template'));
    }

    var hasLocalStorage = supportsLocalStorage();
    var hasTemplate = supportsTemplate();

    function savePage() {
        localStorage.setItem('page', escape(document.getElementById('save').innerHTML));
    }

    function getSavedPage() {
        var pageStr = localStorage.getItem('page');
        if (!(pageStr && pageStr.length)) return null;
        return unescape(pageStr);
    }

    function restoreSavedPage() {
        var savedPage = getSavedPage();
        if (savedPage) {
            document.getElementById('save').innerHTML = savedPage;
        }
    }

    // Source https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
    function download(data, filename, type) {
        var _URL = (window.URL || window.webkitURL);
        var _Blob = (window.Blob || window.MozBlob || window.WebKitBlob);
        var file = new _Blob([String.fromCharCode(0xFEFF), data], {type: type}); // prepend BOM
        if (window.navigator.msSaveOrOpenBlob) { // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else { // Others
            var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                    url = _URL.createObjectURL(file);
            if ('download' in a) {
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                var setImmediate = (window.setImmediate || window.setTimeout);
                setImmediate(function() {
                    document.body.removeChild(a);
                    _URL.revokeObjectURL(url);  
                }, 0);
            }
        }
    }

    // Clone HTML node, but remove extraneous elements and make read-only
    function getPageContents() {
        var baseEl = document.documentElement.cloneNode(true);
        baseEl.querySelector('body').removeAttribute('spellcheck');
        var elsToRemove = baseEl.querySelectorAll('script, iframe, #document-controls, #github-link');
        for (var i = 0, e = elsToRemove.length; i < e; i++) {
            elsToRemove[i].parentElement.removeChild(elsToRemove[i]);
        }

        if (USE_CONTENTEDITABLE) {
            var elsToReset = baseEl.querySelectorAll('[contenteditable]');
            for (var i = 0, e = elsToReset.length; i < e; i++) {
                elsToReset[i].removeAttribute('contenteditable');
                elsToReset[i].removeAttribute('spellcheck');
            }
        }

        return baseEl.innerHTML;
    }

    function addPage() {
        var sheetContainer = document.querySelector('.sheet').parentElement;
        var sheetHtml =
        `<section class="sheet">
            <aside></aside>
            <section></section>
        </section>`;
        sheetContainer.appendChild(htmlToElement(sheetHtml));
    }

    function getButtonActions() {
        return {
            'clear': function(e) {
                requestAnimationFrame(function() {
                    if (hasLocalStorage) {
                        localStorage.clear();
                        location.reload();
                    }
                });
            },
            'print': function(e) {
                requestAnimationFrame(function() {
                    window.print();
                });
            },
            'save': function(e) {
                updateMetadata();
                var pageStr = getPageContents();
                download(pageStr, 'resume.html', 'text/html; charset=UTF-8');
            },
            'addPage': function(e) {
                addPage();
                updatePageNumbers();
            }
        };
    }

    function addDocumentControls() {
        if (!hasTemplate) return false;
        var docControlsStr =
            `<!-- Document control buttons-->
            <div id="document-controls">
                <button data-action="clear" title="Remove saved draft">Clear draft</button>
                <button data-action="save" title="Download as HTML">Save HTML</button>
                <button data-action="print" title="Print">Print</button>
            </div>
            <div id="github-link">     
                <a class="github-button" href="https://github.com/Tombarr/html-resume-template" data-size="large" data-show-count="true" aria-label="Star Tombarr/html-resume-template on GitHub">Star</a>
            </div>`;
        var docControls = htmlToElement(docControlsStr);
        document.body.appendChild(docControls);
        return true;
    }

    function bindDocumentControls() {
        var actions = getButtonActions();
        var docControls = document.getElementById('document-controls');
        if (!docControls) return false;
        var buttons = docControls.querySelectorAll('button[data-action]');
        for (var i = 0, e = buttons.length; i < e; i++) {
            if (buttons[i].dataset.action in actions) {
                buttons[i].addEventListener('click', actions[buttons[i].dataset.action]);
            }
        }
        return true;
    }

    function execCommand(commandName) {
        if ('execCommand' in document) {
            if (!queryCommandSupported(commandName)) return false;

            try {
                return document.execCommand(commandName, false, null);
            } catch(e) {
                return false;
            }
        }

        return false;
    }

    function queryCommandSupported(commandName) {
        if ('queryCommandSupported' in document) {
            return document.queryCommandSupported(commandName);
        }

        return false;
    }

    function bindMutationObserver() {
        if (!('MutationObserver' in window) || !hasLocalStorage) return;

        function onMutate(mutations) {
            requestAnimationFrame(savePage);
        }

        var observer = new MutationObserver(onMutate);

        var config = {
            childList: true,
            characterData: true,
            subtree: true
        };

        observer.observe(document.body, config);
    }

    function makeEditable() {
        if (USE_CONTENTEDITABLE) {
            var editableNodes = document.querySelectorAll('p, span, ul.editable, ol.editable, ul:not(.editable) li, ol:not(.editable) li, time, h1, h2, h3, h4, h5, h6, address');
            for (var i = 0, e = editableNodes.length; i < e; i++) {
                var node = editableNodes[i];
                node.setAttribute('contenteditable', 'true');
                node.setAttribute('spellcheck', 'true');
            }
        } else {
            document.body.setAttribute('spellcheck', 'true');
            document.designMode = 'on';
        }

        if (hasLocalStorage) {
            document.body.addEventListener('focusout', savePage);
            document.body.addEventListener('focusin', savePage);
        }
    }

    function updatePageNumbers() {
        var pages = document.querySelectorAll('.sheet');
        for (var i = 0, e = pages.length; i < e; i++) {
            pages[i].setAttribute('data-page-number', i + 1);
        }
        document.body.setAttribute('data-page-count', pages.length);
    }

    // Source https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
    function getDateFormatted(inDate) {
        var today = new Date();
        var date = (inDate) ? inDate : today;
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        // Pad day and month if needed
        if (dd < 10) {
            dd = '0'+dd;
        }

        if (mm < 10) {
            mm = '0'+mm;
        }

        return yyyy+'-'+mm+'-'+dd;
    }

    // Metadata

    function updateMetadata() {
        updateMetaDate();
        updateMetaSubject();
        updateMetaAuthor();
        updateMetaKeywords();
        updateTitle();
    }

    function updateMetaDate() {
        document.querySelector('meta[name="date"]').setAttribute('content', getDateFormatted());
    }

    function getSummary() {
        var summaryEl = document.querySelector('.summary > p');
        if (!(summaryEl && summaryEl.textContent)) return '';
        var summaryText = summaryEl.textContent.trim().replace(/(\r\n\t|\n|\r\t)/gm, " ").replace(/\s+/g, " ");
        return summaryText;
    }

    function getAuthor() {
        var authorEl = document.querySelector('.name');
        if (!(authorEl && authorEl.textContent)) return '';
        var authorName = authorEl.getAttribute('aria-label').trim();
        return authorName;
    }

    function getSkills() {
        var skillEls = document.querySelectorAll('.skills li');
        if (!(skillEls && skillEls.length)) return [];
        var skills = new Array(skillEls.length);
        for (var i = 0, e = skillEls.length; i < e; i++) {
            skills[i] = skillEls[i].textContent.trim();
        }
        return skills;
    }

    function updateMetaSubject() {
        var summaryText = getSummary();
        if ((!summaryText && summaryText.length)) return;
        document.querySelector('meta[name="subject"]').setAttribute('content', summaryText);
    }

    function updateMetaAuthor() {
        var authorName = getAuthor();
        if (!(authorName && authorName.length)) return;
        document.querySelector('meta[name="author"]').setAttribute('content', authorName);
    }

    function updateMetaKeywords() {
        var skills = getSkills();
        if (!(skills && skills.length)) return;
        document.querySelector('meta[name="keywords"]').setAttribute('content', skills.join(','));
    }

    function updateTitle() {
        var authorName = getAuthor();
        var summaryText = getSummary();
        if ((!summaryText && summaryText.length) || !(authorName && authorName.length)) return;
        document.title = authorName + " - " + summaryText;
    }

    if (hasLocalStorage) {
        restoreSavedPage();
        addDocumentControls();
        bindDocumentControls();
    }

    updatePageNumbers();
    makeEditable();
    requestAnimationFrame(bindMutationObserver);
})();