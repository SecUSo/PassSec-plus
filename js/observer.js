/**
 *
 * @type {{_DEBOUNCE_MS: number, _mutationObserver: null, _pendingNodes: Set<any>, _processing: boolean, _storage: null, _isOwnNode(*): boolean, _debounce(*, *): ((function(...[*]): void)|*), start(*): void, _processPendingNodes(): Promise<void>}}
 */
const Observer = {
    _DEBOUNCE_MS: 200,

    _mutationObserver: null,
    _pendingNodes: new Set(),
    _processing: false,
    _storage: null,

    /**
     *
     * @param node
     * @returns {boolean|boolean}
     * @private
     */
    _isOwnNode(node) {
        return node.id === "addedPassSecCSS" || node.classList?.contains("passSecTooltipSummary")
    },

    /**
     *
     * @param fn
     * @param waitMs
     * @returns {(function(...[*]): void)|*}
     * @private
     */
    _debounce(fn, waitMs) {
        let timeoutId = null;

        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), waitMs);
        }
    },

    /**
     *
     * @param storage
     */
    start(storage) {
        this._storage = storage;
        this._scheduleProcessing = this._debounce(async () => await this._processPendingNodes(), this._DEBOUNCE_MS);

        this._mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE || this._isOwnNode(node)) continue;
                    this._pendingNodes.add(node);
                }
            }

            if (this._pendingNodes.size > 0) this._scheduleProcessing();
        });

        this._mutationObserver.observe(document.body, { childList: true, subtree: true });
    },

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _processPendingNodes() {
        console.log(`try starting processing pending nodes...`);
        if (this._processing) {
            this._scheduleProcessing();
            return;
        }

        const nodes = Array.from(this._pendingNodes).filter((node) => node.isConnected);
        this._pendingNodes.clear();
        if (nodes.length === 0) return;

        console.log(`found ${nodes.length} connected pending nodes...`);

        this._processing = true;
        try {
            const allMatches = new Set();

            for (const node of nodes) {
                if (node.matches(InputField.SELECTOR)) allMatches.add(node);

                const matchedDescendants = node.querySelectorAll(InputField.SELECTOR);
                for (const desc of matchedDescendants) {
                    allMatches.add(desc);
                }
            }

            if (allMatches.size > 0) {
                const matches = Array.from(allMatches);
                console.log(`Batched ${matches.length} unique inputs => start single processInputs run`);
                await InputField.processInputs(this._storage, matches);
            }

        } finally {
            this._processing = false;
        }
    }
}
