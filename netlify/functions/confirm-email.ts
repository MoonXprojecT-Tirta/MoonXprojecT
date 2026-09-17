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

function generateTemporaryPassword() {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

  const random = Array.from(
    crypto.getRandomValues(new Uint8Array(10)),
    (value) => chars[value % chars.length],
  ).join('');

  return `Mx!${random}`;
}

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
      },
    );

    /* =====================================================
       VERIFIKASI AKUN HR / ADMIN
       ===================================================== */

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
        error:
          'Email akun HR/Admin tidak ditemukan.',
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
        stage: 'hris_users',
        error: hrError.message,
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
        error: 'Akun HR/Admin Anda belum aktif.',
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
          'Role Anda tidak memiliki izin untuk mengaktifkan akun karyawan.',
      });
    }

    /* =====================================================
       REQUEST
       ===================================================== */

    let body: {
      employee_id?: string;
    } = {};

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
        error:
          'ID karyawan tidak ditemukan.',
      });
    }

    /* =====================================================
       AMBIL DATA KARYAWAN
       ===================================================== */

    const {
      data: employee,
      error: employeeError,
    } = await supabase
      .from('karyawan')
      .select(
        'id,id_karyawan,nama,email,auth_user_id,email_terverifikasi',
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
        hint: employeeError.hint,
      });
    }

    if (!employee) {
      return json(404, {
        success: false,
        error:
          'Data karyawan tidak ditemukan.',
      });
    }

    const employeeEmail =
      employee.email?.trim().toLowerCase() || '';

    if (!employeeEmail) {
      return json(400, {
        success: false,
        error:
          'Karyawan belum memiliki email.',
      });
    }

    /* =====================================================
       CARI AKUN AUTH YANG SUDAH ADA
       ===================================================== */

    let authUserId =
      employee.auth_user_id || null;

    let createdNow = false;

    let temporaryPassword: string | null =
      null;

    if (!authUserId) {
      const {
        data: usersData,
        error: usersError,
      } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (usersError) {
        return json(500, {
          success: false,
          stage: 'auth_list_users',
          error: usersError.message,
        });
      }

      const existingUser =
        usersData.users.find(
          (user) =>
            user.email?.trim().toLowerCase() ===
            employeeEmail,
        );

      if (existingUser) {
        authUserId = existingUser.id;
      }
    }

    /* =====================================================
       BUAT AKUN SUPABASE AUTH OTOMATIS
       ===================================================== */

    if (!authUserId) {
      temporaryPassword =
        generateTemporaryPassword();

      const {
        data: createdUser,
        error: createError,
      } =
        await supabase.auth.admin.createUser({
          email: employeeEmail,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            nama: employee.nama || '',
          },
        });

      if (createError || !createdUser.user) {
        return json(500, {
          success: false,
          stage: 'auth_create',
          error:
            createError?.message ||
            'Gagal membuat akun login karyawan.',
        });
      }

      authUserId =
        createdUser.user.id;

      createdNow = true;
    }

    /* =====================================================
       PASTIKAN EMAIL TERKONFIRMASI
       ===================================================== */

    const {
      error: confirmError,
    } =
      await supabase.auth.admin.updateUserById(
        authUserId,
        {
          email_confirm: true,
        },
      );

    if (confirmError) {
      return json(500, {
        success: false,
        stage: 'auth_confirm',
        error: confirmError.message,
        status: confirmError.status,
      });
    }

    /* =====================================================
       HUBUNGKAN AUTH DENGAN KARYAWAN
       ===================================================== */

    const {
      error: employeeUpdateError,
    } =
      await supabase
        .from('karyawan')
        .update({
          auth_user_id: authUserId,
          email_terverifikasi: true,
          status_aktif: true,
          status_karyawan: 'Aktif',
        })
        .eq('id', employee.id);

    if (employeeUpdateError) {
      return json(500, {
        success: false,
        stage: 'karyawan_update',
        error:
          employeeUpdateError.message,
        code: employeeUpdateError.code,
        details:
          employeeUpdateError.details,
        hint: employeeUpdateError.hint,
      });
    }

    /* =====================================================
       RESPONSE
       ===================================================== */

    if (createdNow) {
      return json(200, {
        success: true,
        account_created: true,
        message:
          `Akun ${employee.nama} berhasil dibuat dan diaktifkan.`,
        employee_id: employee.id,
        id_karyawan:
          employee.id_karyawan,
        nama: employee.nama,
        email: employee.email,
        auth_user_id: authUserId,
        temporary_password:
          temporaryPassword,
      });
    }

    return json(200, {
      success: true,
      account_created: false,
      message:
        `Akun ${employee.nama} berhasil dihubungkan dan diaktifkan.`,
      employee_id: employee.id,
      id_karyawan:
        employee.id_karyawan,
      nama: employee.nama,
      email: employee.email,
      auth_user_id: authUserId,
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
