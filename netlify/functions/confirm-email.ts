import { createClient } from '@supabase/supabase-js';

type NetlifyEvent = {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
};

const json = (statusCode: number, data: unknown) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(data),
});

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== 'POST') {
    return json(405, {
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return json(500, {
        success: false,
        error:
          'Supabase environment variables belum dikonfigurasi di Netlify.',
      });
    }

    const authorization =
      event.headers?.authorization ||
      event.headers?.Authorization ||
      '';

    const token = authorization
      .replace(/^Bearer\s+/i, '')
      .trim();

    if (!token) {
      return json(401, {
        success: false,
        error: 'Sesi login tidak ditemukan.',
      });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // =====================================================
    // VALIDASI USER HR
    // =====================================================

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return json(401, {
        success: false,
        error:
          authError?.message ||
          'Sesi login tidak valid.',
      });
    }

    const currentEmail =
      authData.user.email?.trim() || '';

    if (!currentEmail) {
      return json(403, {
        success: false,
        error: 'Email akun HR tidak ditemukan.',
      });
    }

    const {
      data: hrUser,
      error: hrError,
    } = await supabase
      .from('hris_users')
      .select('role,status,email')
      .ilike('email', currentEmail)
      .maybeSingle();

    if (hrError) {
      return json(500, {
        success: false,
        error: hrError.message,
        stage: 'hris_users',
      });
    }

    if (!hrUser) {
      return json(403, {
        success: false,
        error:
          'Akun Anda belum terdaftar sebagai pengguna HRIS.',
      });
    }

    if (hrUser.status !== 'Aktif') {
      return json(403, {
        success: false,
        error: 'Akun HR Anda belum aktif.',
      });
    }

    const allowedRoles = [
      'Super Admin',
      'Admin',
      'HRD',
    ];

    if (!allowedRoles.includes(hrUser.role)) {
      return json(403, {
        success: false,
        error:
          'Role Anda tidak memiliki izin untuk mengonfirmasi email karyawan.',
      });
    }

    // =====================================================
    // REQUEST BODY
    // =====================================================

    let body: {
      employee_id?: string;
    };

    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, {
        success: false,
        error: 'Format request tidak valid.',
      });
    }

    const employeeId =
      body.employee_id?.trim();

    if (!employeeId) {
      return json(400, {
        success: false,
        error: 'ID karyawan tidak ditemukan.',
      });
    }

    // =====================================================
    // AMBIL DATA KARYAWAN
    // =====================================================
    // PENTING:
    // email_terverifikasi DIHAPUS karena kolom tersebut
    // memang tidak ada di database.
    // =====================================================

    const {
      data: employee,
      error: employeeError,
    } = await supabase
      .from('karyawan')
      .select(
        'id,id_karyawan,nama,email,auth_user_id'
      )
      .eq('id', employeeId)
      .maybeSingle();

    if (employeeError) {
      return json(500, {
        success: false,
        stage: 'karyawan_select',
        error: employeeError.message,
        code: employeeError.code,
        details: employeeError.details,
      });
    }

    if (!employee) {
      return json(404, {
        success: false,
        error: 'Data karyawan tidak ditemukan.',
      });
    }

    if (!employee.email) {
      return json(400, {
        success: false,
        error: 'Karyawan belum memiliki email.',
      });
    }

    if (!employee.auth_user_id) {
      return json(400, {
        success: false,
        error:
          'Akun login karyawan belum terhubung.',
      });
    }

    // =====================================================
    // KONFIRMASI EMAIL DI SUPABASE AUTH
    // =====================================================

    const {
      error: confirmError,
    } = await supabase.auth.admin.updateUserById(
      employee.auth_user_id,
      {
        email_confirm: true,
      }
    );

    if (confirmError) {
      return json(500, {
        success: false,
        stage: 'auth_update',
        error: confirmError.message,
        status: confirmError.status,
      });
    }

    // =====================================================
    // BERHASIL
    // =====================================================

    return json(200, {
      success: true,
      message:
        `Email ${employee.email} berhasil dikonfirmasi.`,
      employee_id: employee.id,
      id_karyawan: employee.id_karyawan,
      nama: employee.nama,
    });

  } catch (error: unknown) {
    return json(500, {
      success: false,
      stage: 'unexpected',
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};
