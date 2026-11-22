# ABN Marketplace

ABN Marketplace is a unified digital marketplace initiative of **Bahujan Samaj Vikas Sansthan (BSVS)**. It brings three connected experiences into one platform:

- **ABN Store** — products and everyday shopping.
- **ABN Business** — business discovery, services and B2B/B2C connections.
- **ABN Daily Needs** — groceries, fresh produce, dairy and household essentials through ABN-managed stock and logistics.

The initial rollout is planned for blocks across Mau district, Uttar Pradesh, with a longer-term ambition to expand across India.

## Project status

This repository contains the initial web application foundation. It is a starter project, not a production-ready marketplace. Customer accounts, catalogue and inventory workflows, ordering, warehouse operations, delivery management, administration, and role-based access still need to be implemented and tested.

## Technology

- **Web:** Next.js App Router, React and TypeScript.
- **Backend:** Supabase (Postgres, Auth and Storage). Connect the existing Supabase project using environment variables; no credentials are stored in this repository.
- **Android:** A future companion app is planned with Expo / React Native, sharing types and business rules where practical.
- **Hosting:** Free-tier-first deployment is the initial goal. Free tiers have usage limits and may require paid capacity as usage grows.

## Launch decisions

- Cash on Delivery (COD) is the only planned payment method at launch.
- Other payment methods are future considerations and are not enabled by this starter.
- ABN Daily Needs inventory and warehouse operations are intended to be ABN-managed.
- Meat, fish and seafood are excluded from ABN Daily Needs.
- Quick delivery is a target only where stock, distance and operational capacity make it feasible; delivery times must not be guaranteed otherwise.
- The Android app download link will be added after an official app release. Until then, the website displays “Coming soon”.

## Local development

Use Node.js 20.9 or newer.

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/digitalfoxstudios/abn-marketplace.git
   cd abn-marketplace
   \`\`\`
2. Install dependencies: \`npm install\`
3. Create your local environment file: \`cp .env.example .env.local\`
4. Add your Supabase project URL and public anon/publishable key to \`.env.local\`.
5. Start the development server: \`npm run dev\`
6. Open [http://localhost:3000](http://localhost:3000).

To create a production build locally, run \`npm run build\` and then \`npm run start\`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| \`NEXT_PUBLIC_SUPABASE_URL\` | Supabase project URL |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase public anon/publishable key |

Copy \`.env.example\` to \`.env.local\` and fill in values from your Supabase project settings. Never commit \`.env.local\`, service-role keys, database passwords, or other secrets. The browser client helper returns \`null\` until both public variables are configured.

## Security and next milestones

Before enabling real customer data or operations:

1. Design and apply Supabase database migrations.
2. Enable Row Level Security (RLS) on all exposed tables and write role-specific policies.
3. Implement authentication, authorization and protected dashboards.
4. Build catalogue, procurement, inventory, COD orders, delivery and support workflows.
5. Add automated tests, error monitoring, backups and operational safeguards.
6. Configure a hosting provider's environment secrets and verify production builds.

The public homepage is informational only; it does not yet accept orders or provide live delivery availability.
