#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function modify() {
    const layoutPath = path.join(
        process.cwd(),
        'src',
        'app',
        '[countryCode]',
        '(main)',
        'layout.tsx'
    );

    if (!fs.existsSync(layoutPath)) {
        console.warn(`[magenable][medusa-layout-mod] Target file not found: ${layoutPath}`);
        return;
    }

    const componentSourcePath = path.join(
        process.cwd(),
        'node_modules',
        '@magenable',
        'medusa-plugin-top-bar-notification-storefront',
        'src',
        'components'
    );
    const componentDestinationPath =
        path.join(
            process.cwd(),
            'src',
            'modules',
            'common',
            'components'
        );

    fs.cp(
        componentSourcePath,
        componentDestinationPath,
        { recursive: true },
        (err) => {
            if (err) {
                console.error('Error copying file:', err);
                throw err;
            }
            console.log(`[magenable][medusa-layout-mod] ${componentSourcePath} was copied to ${componentDestinationPath}`);
        }
    );

    try {
        let content = fs.readFileSync(layoutPath, 'utf8');
        if (content.includes('MagenableTopBarNotifications')) {
            console.log('[magenable][medusa-layout-mod] Line already exists, skipping.');
            return;
        }

        let search = `import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"\n`
        content = content.replace(
            search,
            search + `import MagenableTopBarNotifications from "@modules/common/components/magenable-top-bar-notification"\n`
        );
        search = `<Nav />`
        content = content.replace(
            search,
            `<MagenableTopBarNotifications/>\n      ` + search
        );

        fs.writeFileSync(layoutPath, content, 'utf8');
        console.log(`[magenable][medusa-layout-mod] Successfully modified: ${layoutPath}`);
    } catch (error) {
        console.error(
            `[magenable][medusa-layout-mod] Failed to modify file: ${error.message}`
        );
    }
}

modify();
