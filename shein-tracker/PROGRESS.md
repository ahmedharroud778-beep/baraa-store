Language and localization
Goal Add Arabic support, ask new users to choose Arabic or English on first visit, and support RTL layout.

Frontend

Add i18n library (if not present): react-i18next or vue-i18n.

Add language files:

locales/en.json — English strings.

locales/ar.json — Arabic strings (use proper Arabic translations).

On app bootstrap, check localStorage key preferredLanguage.

If missing, show a modal full-screen language chooser with two buttons: English and العربية.

When user chooses, set localStorage.preferredLanguage and apply language immediately.

Modal should only show for new users (no preferredLanguage set).

Ensure layout switches to RTL when Arabic selected:

Set document.documentElement.lang = 'ar' and document.documentElement.dir = 'rtl'.

Add CSS rules for RTL adjustments (flex direction, margins, text alignment). Use a CSS utility or :dir(rtl) selectors.

Persist language on server-side for logged-in users by sending Accept-Language or preferredLanguage in profile update API.

Backend

Add preferred_language column to users table (nullable).

API: PATCH /api/users/:id accept preferred_language.

Serve localized content where applicable.

Admin page features for Cities and Clothes weight options
Goal Admin can add/delete cities and add clothing names with weight options.

Database schema

cities table:

id INT PK

name_en VARCHAR

name_ar VARCHAR

created_at, updated_at

clothing_items table:

id INT PK

name_en VARCHAR

name_ar VARCHAR

created_at, updated_at

clothing_weights table:

id INT PK

clothing_item_id FK -> clothing_items.id

label_en VARCHAR (e.g., "Small", "Medium")

label_ar VARCHAR

weight_kg DECIMAL(6,2)

created_at, updated_at

API endpoints

Cities:

GET /api/admin/cities

POST /api/admin/cities body { name_en, name_ar }

DELETE /api/admin/cities/:id

Clothing items and weights:

GET /api/admin/clothing-items

POST /api/admin/clothing-items body { name_en, name_ar }

DELETE /api/admin/clothing-items/:id

POST /api/admin/clothing-items/:id/weights body { label_en, label_ar, weight_kg }

DELETE /api/admin/clothing-weights/:id

Admin UI

Add an Admin > Locations page with:

City list table with Add City form (English + Arabic fields) and delete action.

Add an Admin > Clothing page with:

Clothing item list, ability to add item (EN/AR).

For each item, a sub-list of weight options with fields label_en, label_ar, weight_kg, and add/delete actions.

Validate weight_kg numeric > 0.

Protect endpoints with admin role check.

UI layout changes and placeholders
Goal Move Contact Us above the cart form, left-align it prettily, remove required cart link, add placeholders.

Contact Us placement

In the page template where cart and contact form currently live:

Move the Contact Us block so it appears above the cart form and aligned to the left column.

Use a two-column responsive layout:

Left column: Contact Us card (visually prominent, card with padding, rounded corners).

Right column: Cart summary and checkout actions.

Ensure RTL support: when Arabic is active, columns should mirror (left column becomes visually right but keep semantics consistent). Use CSS grid/flex with order adjustments under :dir(rtl).

Cart link requirement

Remove any validation that makes cart_link required.

Update form schema and frontend validation to make cart_link optional.

Placeholders

For cart link input placeholder set:

English: Put the cart link if you want it; it will be sent to us

Arabic: ضع رابط السلة إذا رغبت؛ سيتم إرساله إلينا

For total input placeholder set:

English: Put the cart total in USD

Arabic: ضع إجمالي السلة بالدولار الأمريكي

Ensure placeholders are localized via i18n files.

Remove Shein total-reading function
Goal Remove the function that attempts to read cart total from Shein and any related code paths.

Steps

Search codebase for functions, services, or cron jobs named like fetchSheinTotal, readSheinTotal, sheinScraper, or any code that calls Shein endpoints.

Remove the function and any imports.

Remove or update any code that depends on its return value:

Replace with fallback behavior: use local cart total only.

If there are feature flags or config toggles for Shein integration, set them to false or remove them.

Remove tests that assert Shein behavior; add tests asserting local total is used.

Run linter and unit tests to ensure no unused imports or references remain.

Rationale Keep codebase simpler and avoid brittle scraping logic.

Backend and validation details
Validation

cities.name_en and cities.name_ar required for POST.

clothing_items.name_en and name_ar required.

clothing_weights.weight_kg numeric > 0.

cart_link optional; if present validate URL format but do not require.

Migrations

Add migrations for cities, clothing_items, clothing_weights, and users.preferred_language.

Provide rollback SQL for each migration.

Permissions

Only users with role = 'admin' can access admin endpoints.

Use middleware to enforce.

Testing and deployment checklist
Unit tests

Admin APIs: CRUD tests for cities and clothing weights.

Validation tests for weight_kg and optional cart_link.

Language selection: test that preferredLanguage persists and that RTL is applied.

Integration tests

New-user flow: first visit shows language modal; choice persists.

Admin UI: add/delete city; add clothing item and weight; verify DB rows.

UI layout: Contact Us appears above cart and left-aligned in LTR; mirrored in RTL.

Manual QA

Verify Arabic translations for all new strings.

Check RTL layout across pages (header, nav, forms).

Confirm cart_link can be empty and placeholders display correctly.

Confirm Shein-related code removed and no errors occur.

Deployment

Deploy migrations in a maintenance window.

Feature-flag the language modal if you want staged rollout.

Monitor logs for errors after removing Shein integration.