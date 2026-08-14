-- ====================================================================
-- Dojang Management System (DMS) - Supabase Schema & Security Rules
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  master_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo TEXT,
  stamp_seal TEXT,
  motto TEXT,
  registration_number TEXT,
  dan_certificate_number TEXT,
  dan_rank TEXT,
  master_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'BRANCH_MANAGER',
  status TEXT DEFAULT 'Active',
  dan_number TEXT,
  dan_rank TEXT,
  registration_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  manager_name TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  father_name TEXT,
  grand_father_name TEXT,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  photo TEXT,
  gender TEXT DEFAULT 'Male',
  dob DATE,
  registration_date DATE DEFAULT CURRENT_DATE,
  belt_rank TEXT DEFAULT 'White',
  blood_group TEXT DEFAULT 'O+',
  phone TEXT,
  hiv_status TEXT DEFAULT 'Negative',
  medical_records TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  emergency_contact TEXT,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT,
  belt_rank TEXT,
  date DATE NOT NULL,
  time TIME,
  status TEXT DEFAULT 'Present',
  marked_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BILLING TABLE
CREATE TABLE IF NOT EXISTS public.billing (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  paid_date DATE,
  receipt_number TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'Unpaid',
  description TEXT,
  month_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  unit_price NUMERIC(10, 2) DEFAULT 0.00,
  supplier TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dojang_id TEXT,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION public.auth_tenant_id()
RETURNS TEXT AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.auth_branch_id()
RETURNS TEXT AS $$
  SELECT branch_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TENANTS POLICIES
CREATE POLICY "Tenants Select Policy" ON public.tenants
  FOR SELECT USING (
    master_id = auth.uid() OR id = public.auth_tenant_id() OR public.auth_user_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "Tenants Update Policy" ON public.tenants
  FOR UPDATE USING (
    master_id = auth.uid() OR (id = public.auth_tenant_id() AND public.auth_user_role() IN ('MASTER', 'SUPER_ADMIN'))
  );

CREATE POLICY "Tenants Insert Policy" ON public.tenants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- PROFILES POLICIES
CREATE POLICY "Profiles Select Policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR tenant_id = public.auth_tenant_id() OR public.auth_user_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "Profiles Update Policy" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.auth_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Profiles Insert Policy" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid() OR auth.uid() IS NOT NULL);

-- BRANCHES POLICIES
CREATE POLICY "Branches Select Policy" ON public.branches
  FOR SELECT USING (
    tenant_id = public.auth_tenant_id() OR public.auth_user_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "Branches Manage Policy" ON public.branches
  FOR ALL USING (
    (tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('MASTER', 'SUPER_ADMIN')) OR public.auth_user_role() = 'SUPER_ADMIN'
  );

-- STUDENTS POLICIES (Enforces Master -> Branch isolation)
CREATE POLICY "Students Select Policy" ON public.students
  FOR SELECT USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      (tenant_id = public.auth_tenant_id() OR dojang_id = public.auth_tenant_id())
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

CREATE POLICY "Students Insert Policy" ON public.students
  FOR INSERT WITH CHECK (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      (tenant_id = public.auth_tenant_id() OR dojang_id = public.auth_tenant_id())
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

CREATE POLICY "Students Update Policy" ON public.students
  FOR UPDATE USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      (tenant_id = public.auth_tenant_id() OR dojang_id = public.auth_tenant_id())
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  ) WITH CHECK (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      (tenant_id = public.auth_tenant_id() OR dojang_id = public.auth_tenant_id())
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

CREATE POLICY "Students Delete Policy" ON public.students
  FOR DELETE USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      (tenant_id = public.auth_tenant_id() OR dojang_id = public.auth_tenant_id())
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

-- ATTENDANCE POLICIES
CREATE POLICY "Attendance Select Policy" ON public.attendance
  FOR SELECT USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      tenant_id = public.auth_tenant_id()
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

CREATE POLICY "Attendance Manage Policy" ON public.attendance
  FOR ALL USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      tenant_id = public.auth_tenant_id()
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

-- BILLING POLICIES
CREATE POLICY "Billing Select Policy" ON public.billing
  FOR SELECT USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      tenant_id = public.auth_tenant_id()
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

CREATE POLICY "Billing Manage Policy" ON public.billing
  FOR ALL USING (
    public.auth_user_role() = 'SUPER_ADMIN'
    OR (
      tenant_id = public.auth_tenant_id()
      AND (public.auth_user_role() <> 'BRANCH_MANAGER' OR branch_id = public.auth_branch_id())
    )
  );

-- INVENTORY POLICIES
CREATE POLICY "Inventory Select Policy" ON public.inventory
  FOR SELECT USING (
    public.auth_user_role() = 'SUPER_ADMIN' OR tenant_id = public.auth_tenant_id()
  );

CREATE POLICY "Inventory Manage Policy" ON public.inventory
  FOR ALL USING (
    public.auth_user_role() = 'SUPER_ADMIN' OR tenant_id = public.auth_tenant_id()
  );

-- EXPENSES POLICIES
CREATE POLICY "Expenses Select Policy" ON public.expenses
  FOR SELECT USING (
    public.auth_user_role() = 'SUPER_ADMIN' OR tenant_id = public.auth_tenant_id()
  );

CREATE POLICY "Expenses Manage Policy" ON public.expenses
  FOR ALL USING (
    public.auth_user_role() = 'SUPER_ADMIN' OR tenant_id = public.auth_tenant_id()
  );

-- ====================================================================
-- STORAGE BUCKETS CONFIGURATION
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dms-assets', 'dms-assets', true), ('student-photos', 'student-photos', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated Upload Storage" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Update Storage" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);
