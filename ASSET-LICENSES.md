# Documentation asset licensing

Presentation code and visual assets are separate inputs. A software license
does not automatically apply to everything shipped by the documentation site.

| Input | Location | Scope and terms |
| --- | --- | --- |
| Shared presentation code | `web/vendor/ui/` (`@jelto/ui`) | Components, styles and test helpers only; no bundled artwork or font binaries. This separation does not assign a new code license. |
| Jelto mascot | `web/vendor/brand/` | Subject to [the Jelto brand notice](web/vendor/brand/NOTICE.txt); excluded from MIT and other software open-source licenses. No trademark or reuse permission is granted by inclusion in this repository. |
| DM Sans | `web/vendor/fonts/` | Font remains under [SIL Open Font License 1.1](web/vendor/fonts/OFL-DM-Sans.txt), with its original copyright notice; it is not MIT licensed. |

Each input has its own version and SHA-256 manifest. Edit the authoritative
source recorded there and refresh with `make inputs` in the monorepo; never
edit the generated copies. Standalone docs builds use these local inputs.

The build copies both notices into `dist/assets/` with content-hashed filenames.
They remain with the original mascot and font bytes in the embedded Go assets.
Font loading stays local through `web/vendor/fonts/dm-sans.css`.

These boundaries cover the shared presentation inputs. Third-party dependencies
and other documentation content retain their own applicable terms.
