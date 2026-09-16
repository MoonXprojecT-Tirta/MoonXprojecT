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
      stage: 'method',
      error: 'Method not allowed',
    });
  }

  try {
    // 1. ENVIRONMENT
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return json(500, {
        success: false,
        stage: 'environment',
        error:
          'SUPABASE_URL / VITE_SUPABASE_URL tidak tersedia di Netlify.',
      });
    }

    if (!serviceRoleKey) {
      return json(500, {
        success: false,
        stage: 'environment',
        error:
          'SUPABASE_SERVICE_ROLE_KEY tidak tersedia di Netlify.',
      });
    }

    // 2. AUTHORIZATION
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
        stage: 'authorization',
        error: 'Sesi login tidak ditemukan.',
      });
    }

    // 3. SUPABASE ADMIN CLIENT
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

    // 4. VALIDATE CURRENT USER
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return json(401, {
        success: false,
        stage: 'auth_user',
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
        stage: 'auth_email',
        error: 'Email akun HR tidak ditemukan.',
      });
    }

    // 5. CHECK HRIS USER
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
        code: hrError.code,
        details: hrError.details,
        hint: hrError.hint,
      });
    }

    if (!hrUser) {
      return json(403, {
        success: false,
        stage: 'hris_users',
        error:
          'Akun Anda belum terdaftar sebagai pengguna HRIS.',
        email: currentEmail,
      });
    }

    if (hrUser.status !== 'Aktif') {
      return json(403, {
        success: false,
        stage: 'hris_users',
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
        stage: 'role',
        error:
          'Role Anda tidak memiliki izin untuk mengonfirmasi email karyawan.',
        role: hrUser.role,
      });
    }

    // 6. REQUEST BODY
    let body: {
      employee_id?: string;
    } = {};

    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return json(400, {
        success: false,
        stage: 'body',
        error: 'Format request JSON tidak valid.',
      });
    }

    const employeeId =
      body.employee_id?.trim();

    if (!employeeId) {
      return json(400, {
        success: false,
        stage: 'body',
        error: 'ID karyawan tidak ditemukan.',
      });
    }

    // 7. GET EMPLOYEE
    const {
      data: employee,
      error: employeeError,
    } = await supabase
      .from('karyawan')
      .select(
        'id,id_karyawan,nama,email,auth_user_id,email_terverifikasi'
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
        stage: 'karyawan_select',
        error: 'Data karyawan tidak ditemukan.',
      });
    }

    if (!employee.email) {
      return json(400, {
        success: false,
        stage: 'employee_email',
        error: 'Karyawan belum memiliki email.',
      });
    }

    if (!employee.auth_user_id) {
      return json(400, {
        success: false,
        stage: 'auth_user_id',
        error:
          'Akun login karyawan belum terhubung.',
      });
    }

    // 8. CONFIRM SUPABASE AUTH EMAIL
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
        name: confirmError.name,
      });
    }

    // 9. UPDATE KARYAWAN
    const {
      error: updateError,
    } = await supabase
      .from('karyawan')
      .update({
        email_terverifikasi: true,
      })
      .eq('id', employee.id);

    if (updateError) {
      return json(500, {
        success: false,
        stage: 'karyawan_update',
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
    }

    // 10. SUCCESS
    return json(200, {
      success: true,
      message:
        `Email ${employee.email} berhasil dikonfirmasi.`,
      employee_id: employee.id,
      id_karyawan: employee.id_karyawan,
      nama: employee.nama,
    });

  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return json(500, {
      success: false,
      stage: 'unexpected',
      error: message,
    });
  }
};
