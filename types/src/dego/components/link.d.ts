import { type DegoComponent, type DegoComponentInvocation } from '../types';
import type { AnchorHTMLAttributes } from '../attributes';
export declare function Link({ content, href, attributes, options, }: {
    content: string | DegoComponentInvocation;
    href: string;
    attributes?: Omit<AnchorHTMLAttributes, 'href' & 'onclick'>;
    options?: {
        prefetch: boolean;
    };
}): DegoComponent;
