# Portfolio content review

Reviewed on 2026-11-10. The local starting page matched `index.html` on the public GitHub repository. Direct access to the live GitHub Pages URL failed during the review, so live rendering was not used as evidence.

## Findings and changes

- Removed overlapping About paragraphs and aligned the introduction, skills and metadata with backend development, Linux and automation.
- Preserved the existing sections, interactions, education and contact details. Updated both EN/RU dictionaries and the English HTML fallback. The initial content pass kept the stylesheet unchanged; the subsequent design update was requested by the owner.
- Added 404BNF and WARP Amnezia Manager, bringing the featured project count to six. Kept mobile and ML technologies within their project descriptions.
- Created separate Nuclear IT Hack entries for Raman Spectroscopy and 404BNF. The third-place result belongs only to Raman Spectroscopy.
- The owner clarified that 404BNF is the team name, also retained as the app name. The portfolio uses the descriptive heading “AI Transcription” / “ИИ-стенографист”, with a single team credit in the project description. Repository URLs remain unchanged, and the two Nuclear IT Hack participations retain separate cards.
- Matched the map's name to its README, corrected the English event spelling to RWB × MEPhI, and described coverage analysis and its Python/Leaflet stack.
- Described Interviewer OS as a frontend MVP with browser-local storage. Replaced the unsupported “AI product” badge with “Frontend MVP”. The linked repository does not establish a working AI interview service.

## Evidence

| Item | Source and scope |
| --- | --- |
| Positioning and hackathon participations | [Owner's profile](https://github.com/sar2718/sar2718/blob/main/README.md) and the supplied brief. The brief establishes that the two Nuclear IT Hack participations are separate. |
| Cian Parser | [Project README](https://github.com/sar2718/cian_parser#readme) confirms real-estate collection, analysis, ClickHouse storage and H3-based map visualization. The existing project and source link were retained. |
| Raman Spectroscopy | [Project README](https://github.com/yulia-pecheykina/raman_spectroscopy#readme) confirms the team project, spectral analysis and classification. Third place and the event year follow the brief and owner's profile. |
| 404BNF | [README](https://github.com/sar2718/404BNF#readme), [architecture](https://github.com/sar2718/404BNF/blob/main/docs/ARCHITECTURE.md) and [limitations](https://github.com/sar2718/404BNF/blob/main/docs/LIMITATIONS.md) describe local Russian ASR, diarization, transcript editing, TXT/JSON export, Kotlin, Compose, ONNX Runtime and GigaAM. No quality, speed or production-readiness claims were added. |
| Interviewer OS / Impulse T1 | [Frontend README](https://github.com/sar2718/interviewer-os-frontend#readme) confirms candidate/admin workflows, RU/EN and localStorage. The event association and 2026 year follow the brief and owner's profile; the README does not independently confirm the participation date. |
| RWB × MEPhI | [Russ Control Dashboard README](https://github.com/sar2718/russ-tech-hackathon-map#readme) confirms the Russtech case, advertising surfaces, public IP cameras, coverage estimates, Python/Pandas and Leaflet/JavaScript. No award or verified real-world visibility claim was added. |
| Linux and automation | [WARP Amnezia Manager README](https://github.com/sar2718/warp-amnezia-manager#readme) confirms Bash, configuration generation, registration tracking and API-based revocation. It credits an upstream project; the portfolio does not claim original authorship of that upstream code. [Linux Admin Basics](https://github.com/sar2718/linux-admin-basics#readme) supports the Linux focus. |

## Factual boundaries

Event years are retained from the owner's brief; repository creation dates are not used as event dates. No exact dates, additional awards, employment history or individual team responsibilities were inferred. Descriptions state what the projects do; specific personal responsibilities need explicit confirmation before being added. Existing education, language proficiency and other unchanged skills were retained rather than independently recertified.

## Validation

`npm run check` and `git diff --check` passed. The final Chrome review exercised 65 checks against the local HTTP preview, including EN/RU at 20 viewport widths from 320 to 3440 px and a mobile viewport at DPR 3. It covered overflow, project counts, naming, separate Nuclear entries, project anchors, keyboard navigation (Enter, Space, Tab and Escape), menu resizing, language persistence, invalid preferences, unavailable localStorage, the browser's Russian default, ordinary/reduced motion, disabled JavaScript, local assets and the nested 404 route. No runtime exceptions or functional failures remained. The Russian award summary was corrected from “3rd” to “3-е”. A discretionary break in the Russian hero heading supports narrow layouts.

Ten distinct external URLs returned HTTP 200, including all project repositories, the GitHub profile/repository list, MEPhI and School 21. The Telegram link could not be verified because both direct HTTPS and the web tool failed from this environment; its existing address was retained. This is local Chromium verification, not a cross-browser or production-deployment guarantee.

## Design update

The owner requested a fuller composition without visual clutter, with equal attention to mobile devices and a 27-inch, approximately 2560 × 1440 display. The hero now uses content-based height, a larger three-line heading, a Cian Parser workflow overview and direct links to three existing projects. The name is visible in the hero even when the mobile navigation collapses the brand. The content width is bounded on large displays; smaller layouts stack naturally. The featured diagram is omitted on small phones, where Cian Parser remains available in Projects. Skill and project cards use tighter spacing, technology labels are larger, and the four hackathon entries form a two-column desktop grid. The dark palette and cyan/teal accents are retained. MEPhI links to its official site in the same way as School 21.

## Language review

Both versions were edited as standalone portfolio copy, with equivalent project facts and a consistent, restrained tone. Abstract claims and literal translations were replaced with concrete descriptions, including on-device transcription, speaker separation and estimated camera visibility. Section headings, education descriptions, contact prompts and the 404 page were revised. Previously untranslated interface text now includes institution/event names, location, general skill tags and the footer name. Product names, repository addresses and technology names were retained. English HTML fallbacks match the updated dictionary, and the revised copy passed the browser layout checks in both languages.

The owner clarified that Systems Analysis and Control is the main field of study and Software Engineering is an additional qualification within the same diploma. The education entry lists both together and makes this distinction without implying separate parallel study. The award summary now spells out “3rd place” / “3-е место” so it is understandable on its own.
