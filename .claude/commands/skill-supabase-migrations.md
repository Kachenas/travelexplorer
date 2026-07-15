# Skill: Supabase Migrations

## Overview

Database changes are managed through SQL migration files in `supabase/migrations/`. Migrations are version-controlled and applied in order.

## Creating Migrations

```bash
# Create a new migration file
npm run db:migration:new <name>
# Creates: supabase/migrations/<timestamp>_<name>.sql
```

Example names: `create_products`, `add_status_to_orders`, `create_rls_policies`

## Writing Migrations

Write raw SQL in the generated migration file:

```sql
-- supabase/migrations/<timestamp>_create_products.sql

CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common query patterns
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- MANDATORY: Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Define RLS policies
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);
```

## Row Level Security (MANDATORY)

**Every table MUST have RLS enabled.** Without RLS, the anon key grants unrestricted access to all data.

```sql
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
```

### Common RLS Policy Patterns

#### Public read, authenticated write

```sql
-- Anyone can read
CREATE POLICY "Public read access"
  ON public.products FOR SELECT
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated insert"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

#### Owner-only access

```sql
-- Users can only read their own rows
CREATE POLICY "Owner select"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "Owner update"
  ON public.documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own rows
CREATE POLICY "Owner delete"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);
```

#### Role-based access

```sql
-- Admin-only access
CREATE POLICY "Admin full access"
  ON public.settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Combined owner + admin

```sql
-- Owners can read/update, admins can do everything
CREATE POLICY "Owner or admin select"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Applying Migrations

```bash
# Apply pending migrations to local database
npm run db:push

# Reset database and re-apply all migrations from scratch
npm run db:reset
```

## Type Generation (MANDATORY after schema changes)

After every migration, regenerate TypeScript types:

```bash
npm run db:types
```

This runs:
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

The generated `src/types/supabase.ts` file provides typed access to all tables:

```ts
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
```

**Do NOT manually edit `src/types/supabase.ts`** -- it is auto-generated and will be overwritten.

## Indexes

Add indexes for columns used in `WHERE`, `ORDER BY`, or `JOIN` clauses:

```sql
-- Single column index
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- Composite index for common query patterns
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_profiles_email ON public.profiles(email);
```

## Updated At Trigger

Auto-update `updated_at` column on row changes:

```sql
-- Create the trigger function (once per database)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to each table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

## Enums

Use PostgreSQL enums for fixed sets of values:

```sql
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded'
);

CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status public.order_status DEFAULT 'pending' NOT NULL,
  -- ...
);
```

## Migration Checklist

When creating a new migration, verify:

- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is present for every new table
- [ ] At least one RLS policy is defined for each new table
- [ ] Indexes are created for foreign key columns and common query patterns
- [ ] `created_at` and `updated_at` columns are included with defaults
- [ ] `updated_at` trigger is attached if the table will be updated
- [ ] Foreign key references use `ON DELETE CASCADE` or appropriate action
- [ ] Primary keys use `UUID DEFAULT gen_random_uuid()`
- [ ] Column names follow `snake_case` convention
- [ ] Table names follow lowercase plural `snake_case` convention
- [ ] After applying: `npm run db:types` was run to regenerate TypeScript types
