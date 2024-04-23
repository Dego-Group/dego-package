export interface HTMLElementAttributes {
    /**
     * Specifies a shortcut key to activate/focus an element
     */
    accesskey?: string;
    /**
     * Specifies one or more classnames for an element (refers to a class in a style sheet)
     */
    class?: string;
    /**
     * Specifies whether the content of an element is editable or not
     */
    contenteditable?: boolean;
    /**
     * Used to store custom data private to the page or application
     */
    dataset?: Record<string, string>;
    /**
     * Specifies the text direction for the content in an element
     */
    dir?: 'ltr' | 'rtl' | 'auto';
    /**
     * Specifies whether an element is draggable or not
     */
    draggable?: boolean;
    /**
     * Specifies the text of the enter-key on a virtual keyboard
     */
    enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
    /**
     * Specifies that an element is not yet, or is no longer, relevant
     */
    hidden?: boolean;
    /**
     * Specifies a unique id for an element
     */
    id?: string;
    /**
     * Specifies that the browser should ignore this section
     */
    inert?: boolean;
    /**
     * Specifies the mode of a virtual keyboard
     */
    inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    /**
     * Specifies the language of the element's content
     */
    lang?: string;
    /**
     * Specifies a popover element
     */
    popover?: string;
    /**
     * Specifies whether the element is to have its spelling and grammar checked or not
     */
    spellcheck?: boolean;
    /**
     * Specifies an inline CSS style for an element
     */
    style?: string;
    /**
     * Specifies the tabbing order of an element
     */
    tabindex?: number;
    /**
     * Specifies extra information about an element
     */
    title?: string;
    /**
     * Specifies whether the content of an element should be translated or not
     */
    translate?: boolean;
}
export interface AnchorHTMLAttributes extends HTMLElementAttributes {
    /**
     * Specifies that the target will be downloaded when a user clicks on the hyperlink
     */
    download?: string;
    /**
     * Specifies the URL of the page the link goes to
     */
    href?: string;
    /**
     * Specifies the language of the linked document
     */
    hreflang?: string;
    /**
     * Specifies what media/device the linked document is optimized for
     */
    media?: string;
    /**
     * Specifies a space-separated list of URLs to which, when the link is followed, post requests with the body 'ping' will be sent by the browser (in the background). Typically used for tracking.
     */
    ping?: string;
    /**
     * Specifies which referrer information to send with the link
     */
    referrerpolic?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    /**
     * Specifies the relationship between the current document and the linked document
     */
    rel?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'next' | 'nofollow' | 'noreferrer' | 'noopener' | 'prev' | 'search' | 'tag';
    /**
     * Specifies where to open the linked document
     */
    target?: '_blank' | '_parent' | '_self' | '_top';
    /**
     * Specifies the media type of the linked document
     */
    type?: string;
}
export declare function attr<T extends HTMLElementAttributes>(attributes: T): string;
