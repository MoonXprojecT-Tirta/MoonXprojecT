import { useEffect, useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase/client';
import { signIn } from './lib/auth';

import moonLogo from './assets/moon-logo.svg';

import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import EmployeeRegister from './pages/EmployeeRegister/EmployeeRegister';
import EmployeePortal from './pages/EmployeePortal/EmployeePortal';

import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global/index.css';
type View = 'login' | 'admin' | 'employee' | 'register';

type HrRole =
  | 'Super Admin'
  | 'Admin'
  | 'HRD'
  | 'Payroll'
  | 'Supervisor';

const HR_ROLES: HrRole[] = [
  'Super Admin',
  'Admin',
  'HRD',
  'Payroll',
  'Supervisor',
];

/* =========================================================
   RESOLVE ACCOUNT
   Menentukan halaman berdasarkan email + role
   ========================================================= */

async function resolveAccount(): Promise<{
  view: View;
  role: string;
  employeeLinked: boolean;
}> {
  const { data } = await supabase.auth.getUser();

  const user = data.user;

  if (!user?.email) {
    return {
      view: 'login',
      role: '',
      employeeLinked: false,
    };
  }

  const email = user.email.trim().toLowerCase();

  /* =======================================================
     1. CEK AKUN HR / ADMIN
     ======================================================= */

  const { data: profile } = await supabase
    .from('hris_users')
    .select('role,status')
    .ilike('email', email)
    .maybeSingle();

  if (
    profile?.status === 'Aktif' &&
    HR_ROLES.includes(profile.role as HrRole)
  ) {
    return {
      view: 'admin',
      role: profile.role,
      employeeLinked: true,
    };
  }

  /* =======================================================
     2. CEK AKUN KARYAWAN
     ======================================================= */

  const { data: employee } = await supabase
    .from('karyawan')
    .select(
      'id,id_karyawan,nama,email,auth_user_id,status_aktif,status_karyawan'
    )
    .or(
      `auth_user_id.eq.${user.id},email.ilike.${email}`
    )
    .limit(1)
    .maybeSingle();

  if (employee) {
    /*
     * Jika email akun sama dengan email master karyawan,
     * otomatis hubungkan auth_user_id.
     */

    if (
      !employee.auth_user_id &&
      employee.email &&
      employee.email.trim().toLowerCase() === email
    ) {
      await supabase
        .from('karyawan')
        .update({
          auth_user_id: user.id,
        })
        .eq('id', employee.id);
    }

    return {
      view: 'employee',
      role: 'Karyawan',
      employeeLinked: true,
    };
  }

  /*
   * Akun Supabase ada tetapi belum ditemukan
   * pada master karyawan.
   */

  return {
    view: 'employee',
    role: 'Karyawan',
    employeeLinked: false,
  };
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [view, setView] = useState<View>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* =======================================================
     NAVIGATION
     ======================================================= */

  const go = (next: View) => {
    setError('');
    setView(next);

    window.location.hash = `/${next}`;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =======================================================
     INITIAL SESSION CHECK
     ======================================================= */

  useEffect(() => {
    let active = true;

    const boot = async () => {
      setChecking(true);

      /* ---------------------------------------------------
         SUPABASE BELUM DIKONFIGURASI
         --------------------------------------------------- */

      if (!isSupabaseConfigured) {
        if (active) {
          setView('login');
          setChecking(false);
          window.location.hash = '/login';
        }

        return;
      }

      /* ---------------------------------------------------
         CEK SESSION
         --------------------------------------------------- */

      const { data } = await supabase.auth.getSession();

      if (!active) return;

      /* ---------------------------------------------------
         TIDAK ADA SESSION → LOGIN
         --------------------------------------------------- */

      if (!data.session) {
        setView('login');
        window.location.hash = '/login';
        setChecking(false);

        return;
      }

      /* ---------------------------------------------------
         ADA SESSION → TENTUKAN ROLE
         --------------------------------------------------- */

      const account = await resolveAccount();

      if (!active) return;

      setView(account.view);

      window.location.hash = `/${account.view}`;

      setChecking(false);
    };

    void boot();

    /* =====================================================
       AUTH STATE LISTENER
       ===================================================== */

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!active) return;

          /* -----------------------------------------------
             LOGOUT
             ----------------------------------------------- */

          if (event === 'SIGNED_OUT' || !session) {
            setView('login');
            setEmail('');
            setPassword('');
            setError('');
            setChecking(false);

            window.location.hash = '/login';

            return;
          }

          /* -----------------------------------------------
             LOGIN BERHASIL
             ----------------------------------------------- */

          if (event === 'SIGNED_IN') {
            const account = await resolveAccount();

            if (!active) return;

            setView(account.view);
            setPassword('');
            setError('');
            setChecking(false);

            window.location.hash = `/${account.view}`;
          }
        }
      );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     LOGIN
     ======================================================= */

  const login = async (event: FormEvent) => {
    event.preventDefault();

    setError('');

    if (!isSupabaseConfigured) {
      setError(
        'Supabase belum dikonfigurasi. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      );

      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Email dan password wajib diisi.');

      return;
    }

    setLoading(true);

    const { data, error: loginError } =
      await signIn(cleanEmail, password);

    if (loginError || !data.user) {
      setLoading(false);

      setError(
        loginError?.message ||
          'Email atau password tidak valid.'
      );

      return;
    }

    /* ---------------------------------------------------
       SETELAH LOGIN → BACA ROLE
       --------------------------------------------------- */

    const account = await resolveAccount();

    setView(account.view);

    setLoading(false);
    setPassword('');
    setError('');

    window.location.hash = `/${account.view}`;
  };

  /* =======================================================
     LOADING / SESSION CHECK
     ======================================================= */

  if (checking) {
    return (
      <div className="unified-login-page">
        <div className="unified-login-card compact">

          <div className="unified-logo">
  <img
    src={moonLogo}
    alt="MoonXprojecT"
    className="moon-logo"
  />
</div>

          <div className="unified-loading">
            Memeriksa sesi keamanan...
          </div>

        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER APPLICATION
     ======================================================= */

  return (
    <ErrorBoundary>

      <div className="app-root">

        {/* =================================================
            LOGIN
            ================================================= */}

        {view === 'login' && (
          <LoginScreen
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            onSubmit={login}
            onRegister={() => go('register')}
            loading={loading}
            error={error}
          />
        )}

        {/* =================================================
            REGISTRASI KARYAWAN
            ================================================= */}

        {view === 'register' && (
          <div className="public-page">

            <EmployeeRegister
              onBack={() => go('login')}
            />

          </div>
        )}

        {/* =================================================
            DASHBOARD HR
            ================================================= */}

        {view === 'admin' && (
          <AdminDashboard />
        )}

        {/* =================================================
            PORTAL KARYAWAN
            ================================================= */}

        {view === 'employee' && (
          <EmployeePortal />
        )}

      </div>

    </ErrorBoundary>
  );
}

/* =========================================================
   LOGIN SCREEN
   ========================================================= */

function LoginScreen({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  onRegister,
  loading,
  error,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onRegister: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <main className="unified-login-page">

      <section className="unified-login-card">

        {/* =================================================
            BRAND
            ================================================= */}

        <div className="unified-brand">

          <div className="unified-logo">
            M
          </div>

          <div>

            <strong>
              MoonXprojecT
            </strong>

            <small>
              Human Resources Information System
            </small>

          </div>

        </div>

        {/* =================================================
            HEADING
            ================================================= */}

        <div className="unified-login-heading">

          <span>
            SECURE ACCESS
          </span>

          <h1>
            Masuk ke MoonXprojecT
          </h1>

          <p>
            Gunakan akun Anda untuk mengakses sistem
            sesuai jabatan dan kewenangan.
          </p>

        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="unified-login-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
            ================================================= */}

        <form
          onSubmit={onSubmit}
          className="unified-login-form"
        >

          <label>

            <span>
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="nama@email.com"
              autoComplete="username"
              disabled={loading}
            />

          </label>

          <label>

            <span>
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Masukkan password"
              autoComplete="current-password"
              disabled={loading}
            />

          </label>

          <button
            type="submit"
            className="unified-login-button"
            disabled={loading}
          >
            {loading
              ? 'Memverifikasi...'
              : 'Masuk ke Sistem'}
          </button>

        </form>

        {/* =================================================
            REGISTER
            ================================================= */}

        <div className="unified-login-register">

          <span>
            Belum memiliki akun karyawan?
          </span>

          <button
            type="button"
            onClick={onRegister}
            disabled={loading}
          >
            Daftar Karyawan
          </button>

        </div>

        {/* =================================================
            SECURITY
            ================================================= */}

        <div className="unified-login-security">

          <span>
            🔒
          </span>

          <div>

            <strong>
              Secure HR Access
            </strong>

            <small>
              Akses otomatis ditentukan berdasarkan
              role akun Anda.
            </small>

          </div>

        </div>

      </section>

    </main>
  );
}
.unified-logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.moon-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
}
