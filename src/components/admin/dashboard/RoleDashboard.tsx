import React from 'react';

export type DashboardRole =
  | 'Super Admin'
  | 'Admin'
  | 'HRD'
  | 'Payroll'
  | 'Supervisor'
  | 'Karyawan';

export type RoleDashboardEmployee = {
  id: string;
  id_karyawan?: string;
  nama: string;
  jabatan?: string;
  departemen?: string;
  status_aktif?: boolean;
  gaji_pokok?: number;
};

export type RoleDashboardAttendance = {
  id: string;
  nama?: string;
  id_karyawan?: string;
  tanggal?: string;
  status?: string;
  keterlambatan_menit?: number;
};

type Props = {
  role: string;
  employees: RoleDashboardEmployee[];
  attendance: RoleDashboardAttendance[];
  present: number;
  late: number;
  payroll: number;
  onNavigate: (menu: any) => void;
};

function money(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d6ae58',
        borderRadius: 14,
        padding: 20,
        minHeight: 125,
        boxShadow: '0 4px 14px rgba(16,26,51,.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#667085',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 27,
              fontWeight: 800,
              color: '#101a33',
            }}
          >
            {value}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: '#667085',
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: '#101a33',
            color: '#d6ae58',
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        marginBottom: 22,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#d6ae58',
            letterSpacing: '.12em',
            marginBottom: 7,
          }}
        >
          {eyebrow}
        </div>

        <h1
          style={{
            margin: 0,
            color: '#101a33',
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: '7px 0 0',
            color: '#667085',
            fontSize: 14,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          background: '#101a33',
          color: '#ffffff',
          borderRadius: 10,
          padding: '9px 14px',
          fontSize: 12,
          fontWeight: 700,
          border: '1px solid #d6ae58',
        }}
      >
        ● Sistem Operational
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#ffffff',
        border: '1px solid #d6ae58',
        borderRadius: 12,
        padding: 15,
        cursor: 'pointer',
        transition: 'all .2s ease',
      }}
    >
      <div
        style={{
          color: '#101a33',
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 5,
          color: '#667085',
          fontSize: 12,
        }}
      >
        {description}
      </div>
    </button>
  );
}

function RecentAttendance({
  attendance,
}: {
  attendance: RoleDashboardAttendance[];
}) {
  const rows = attendance.slice(0, 7);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d6ae58',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 18,
          borderBottom: '1px solid #e7eaf0',
        }}
      >
        <div
          style={{
            color: '#101a33',
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          Aktivitas Absensi Terbaru
        </div>

        <div
          style={{
            color: '#667085',
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Data absensi terbaru dari database.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 600,
          }}
        >
          <thead>
            <tr>
              {['Karyawan', 'ID', 'Tanggal', 'Status'].map((item) => (
                <th
                  key={item}
                  style={{
                    textAlign: 'left',
                    padding: '12px 15px',
                    fontSize: 11,
                    color: '#667085',
                    borderBottom: '1px solid #e7eaf0',
                    background: '#f8fafc',
                  }}
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: 25,
                    textAlign: 'center',
                    color: '#667085',
                  }}
                >
                  Belum ada data absensi.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: '12px 15px', fontWeight: 700 }}>
                    {row.nama || '-'}
                  </td>

                  <td style={{ padding: '12px 15px' }}>
                    {row.id_karyawan || '-'}
                  </td>

                  <td style={{ padding: '12px 15px' }}>
                    {row.tanggal || '-'}
                  </td>

                  <td style={{ padding: '12px 15px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '5px 9px',
                        borderRadius: 999,
                        background:
                          String(row.status)
                            .toLowerCase()
                            .includes('terlambat')
                            ? '#fff7ed'
                            : '#ecfdf3',
                        color:
                          String(row.status)
                            .toLowerCase()
                            .includes('terlambat')
                            ? '#c2410c'
                            : '#15803d',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {row.status || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorkforceSummary({
  employees,
}: {
  employees: RoleDashboardEmployee[];
}) {
  const departments = employees.reduce<Record<string, number>>(
    (result, employee) => {
      const department = employee.departemen || 'Belum diatur';

      result[department] = (result[department] || 0) + 1;

      return result;
    },
    {}
  );

  const rows = Object.entries(departments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const max = Math.max(1, ...rows.map((item) => item[1]));

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #d6ae58',
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          color: '#101a33',
          fontSize: 16,
        }}
      >
        Komposisi Workforce
      </div>

      <div
        style={{
          color: '#667085',
          fontSize: 12,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Distribusi karyawan berdasarkan departemen.
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            padding: 25,
            textAlign: 'center',
            color: '#667085',
          }}
        >
          Belum ada data departemen.
        </div>
      ) : (
        rows.map(([department, count]) => (
          <div key={department} style={{ marginBottom: 15 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 7,
                fontSize: 12,
              }}
            >
              <span style={{ color: '#172033' }}>{department}</span>
              <b style={{ color: '#101a33' }}>{count}</b>
            </div>

            <div
              style={{
                height: 8,
                background: '#edf0f4',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round((count / max) * 100)}%`,
                  height: '100%',
                  background: '#101a33',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SuperAdminDashboard({
  employees,
  attendance,
  present,
  late,
  payroll,
  onNavigate,
}: Props) {
  const active = employees.filter(
    (employee) => employee.status_aktif !== false
  ).length;

  const attendanceRate =
    employees.length > 0
      ? Math.min(
          100,
          Math.round((present / Math.max(1, employees.length)) * 100)
        )
      : 0;

  return (
    <>
      <DashboardHeader
        eyebrow="SUPER ADMIN COMMAND CENTER"
        title="Executive HR Command Center"
        description="Pusat kendali penuh untuk workforce, attendance, payroll, talent, security, dan sistem."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 15,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Total Karyawan"
          value={String(employees.length)}
          description={`${active} karyawan aktif`}
          icon="👥"
        />

        <StatCard
          title="Attendance"
          value={`${attendanceRate}%`}
          description={`${present} hadir · ${late} terlambat`}
          icon="✓"
        />

        <StatCard
          title="Payroll Workforce"
          value={money(payroll)}
          description="Total gaji pokok"
          icon="Rp"
        />

        <StatCard
          title="Attendance Records"
          value={String(attendance.length)}
          description="Record tersimpan"
          icon="◷"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,.6fr)',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <WorkforceSummary employees={employees} />

        <div
          style={{
            background: '#101a33',
            border: '1px solid #d6ae58',
            borderRadius: 14,
            padding: 18,
            color: '#ffffff',
          }}
        >
          <div
            style={{
              color: '#d6ae58',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.1em',
            }}
          >
            SYSTEM CONTROL
          </div>

          <h2
            style={{
              margin: '10px 0 6px',
              fontSize: 19,
            }}
          >
            Full Enterprise Access
          </h2>

          <p
            style={{
              margin: 0,
              color: '#cbd5e1',
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Super Admin memiliki akses ke seluruh modul HRIS,
            permission, security, audit, payroll, dan konfigurasi sistem.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('roles')}
            style={{
              marginTop: 18,
              border: '1px solid #d6ae58',
              background: '#d6ae58',
              color: '#101a33',
              padding: '9px 13px',
              borderRadius: 8,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Kelola Role & Permission
          </button>
        </div>
      </div>

      <RecentAttendance attendance={attendance} />

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            fontWeight: 800,
            color: '#101a33',
            marginBottom: 12,
          }}
        >
          Quick Access
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
            gap: 12,
          }}
        >
          <QuickAction
            title="Master Karyawan"
            description="Kelola seluruh data workforce."
            onClick={() => onNavigate('employees')}
          />

          <QuickAction
            title="Payroll"
            description="Buka pusat payroll enterprise."
            onClick={() => onNavigate('payroll')}
          />

          <QuickAction
            title="Audit Log"
            description="Pantau aktivitas sistem."
            onClick={() => onNavigate('audit')}
          />

          <QuickAction
            title="Security Center"
            description="Kontrol keamanan sistem."
            onClick={() => onNavigate('security-v21')}
          />
        </div>
      </div>
    </>
  );
}

function AdminDashboard({
  employees,
  attendance,
  present,
  late,
  payroll,
  onNavigate,
}: Props) {
  const active = employees.filter(
    (employee) => employee.status_aktif !== false
  ).length;

  const attendanceRate =
    employees.length > 0
      ? Math.min(
          100,
          Math.round((present / Math.max(1, employees.length)) * 100)
        )
      : 0;

  return (
    <>
      <DashboardHeader
        eyebrow="ADMIN OPERATIONS"
        title="Operations Dashboard"
        description="Monitoring operasional harian, karyawan, absensi, jadwal, payroll, dan laporan."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 15,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Karyawan Aktif"
          value={String(active)}
          description={`Dari ${employees.length} total karyawan`}
          icon="👥"
        />

        <StatCard
          title="Hadir Hari Ini"
          value={String(present)}
          description={`${attendanceRate}% attendance`}
          icon="✓"
        />

        <StatCard
          title="Terlambat"
          value={String(late)}
          description="Perlu monitoring"
          icon="!"
        />

        <StatCard
          title="Payroll"
          value={money(payroll)}
          description="Total gaji pokok"
          icon="Rp"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <QuickAction
          title="Semua Karyawan"
          description="Buka database karyawan."
          onClick={() => onNavigate('employees')}
        />

        <QuickAction
          title="Absensi Hari Ini"
          description="Monitor attendance hari ini."
          onClick={() => onNavigate('attendance-today')}
        />

        <QuickAction
          title="Jadwal Kerja"
          description="Kelola jadwal dan shift."
          onClick={() => onNavigate('schedule')}
        />

        <QuickAction
          title="Payroll"
          description="Lihat proses payroll."
          onClick={() => onNavigate('payroll')}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <WorkforceSummary employees={employees} />

        <RecentAttendance attendance={attendance} />
      </div>
    </>
  );
}

function HRDDashboard({
  employees,
  attendance,
  present,
  late,
  onNavigate,
}: Props) {
  const active = employees.filter(
    (employee) => employee.status_aktif !== false
  ).length;

  const inactive = Math.max(0, employees.length - active);

  const attendanceRate =
    employees.length > 0
      ? Math.min(
          100,
          Math.round((present / Math.max(1, employees.length)) * 100)
        )
      : 0;

  return (
    <>
      <DashboardHeader
        eyebrow="HRD PEOPLE MANAGEMENT"
        title="People & HR Dashboard"
        description="Pusat monitoring employee lifecycle, attendance, leave, talent, KPI, dan laporan HR."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 15,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Total Workforce"
          value={String(employees.length)}
          description={`${active} aktif · ${inactive} nonaktif`}
          icon="👥"
        />

        <StatCard
          title="Attendance"
          value={`${attendanceRate}%`}
          description={`${present} hadir`}
          icon="✓"
        />

        <StatCard
          title="Terlambat"
          value={String(late)}
          description="Employee attendance"
          icon="!"
        />

        <StatCard
          title="Data Absensi"
          value={String(attendance.length)}
          description="Record tersedia"
          icon="◷"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <QuickAction
          title="Employee Master"
          description="Kelola data karyawan."
          onClick={() => onNavigate('employees')}
        />

        <QuickAction
          title="Employee 360°"
          description="Lihat profil employee secara lengkap."
          onClick={() => onNavigate('employee-360')}
        />

        <QuickAction
          title="Leave Management"
          description="Pengajuan dan saldo cuti."
          onClick={() => onNavigate('leave-request')}
        />

        <QuickAction
          title="Performance & KPI"
          description="Monitor performance dan target."
          onClick={() => onNavigate('performance')}
        />

        <QuickAction
          title="Recruitment ATS"
          description="Kelola kandidat dan recruitment."
          onClick={() => onNavigate('recruitment-v25')}
        />

        <QuickAction
          title="Reports"
          description="Laporan HR dan workforce."
          onClick={() => onNavigate('reports')}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 18,
        }}
      >
        <WorkforceSummary employees={employees} />

        <RecentAttendance attendance={attendance} />
      </div>
    </>
  );
}

function RestrictedDashboard({
  role,
  employees,
  attendance,
  present,
  late,
  onNavigate,
}: Props) {
  return (
    <>
      <DashboardHeader
        eyebrow={`${role.toUpperCase()} DASHBOARD`}
        title={`${role} Dashboard`}
        description="Dashboard berdasarkan hak akses akun Anda."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 15,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Karyawan"
          value={String(employees.length)}
          description="Data workforce"
          icon="👥"
        />

        <StatCard
          title="Hadir"
          value={String(present)}
          description="Attendance"
          icon="✓"
        />

        <StatCard
          title="Terlambat"
          value={String(late)}
          description="Attendance exception"
          icon="!"
        />

        <StatCard
          title="Absensi"
          value={String(attendance.length)}
          description="Record"
          icon="◷"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 12,
        }}
      >
        <QuickAction
          title="Karyawan"
          description="Lihat data karyawan."
          onClick={() => onNavigate('employees')}
        />

        <QuickAction
          title="Absensi"
          description="Lihat data absensi."
          onClick={() => onNavigate('attendance')}
        />

        <QuickAction
          title="Laporan"
          description="Buka laporan."
          onClick={() => onNavigate('reports')}
        />
      </div>
    </>
  );
}

export default function RoleDashboard(props: Props) {
  const normalizedRole = String(props.role || '').trim();

  if (normalizedRole === 'Super Admin') {
    return <SuperAdminDashboard {...props} />;
  }

  if (normalizedRole === 'Admin') {
    return <AdminDashboard {...props} />;
  }

  if (normalizedRole === 'HRD') {
    return <HRDDashboard {...props} />;
  }

  return <RestrictedDashboard {...props} />;
}
