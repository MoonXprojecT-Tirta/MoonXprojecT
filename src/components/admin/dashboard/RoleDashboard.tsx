import type { Karyawan, Absensi } from '../../../types';

type DashboardRole = 'Super Admin' | 'Admin' | 'HRD' | string;

interface RoleDashboardProps {
  role: DashboardRole;
  employees: Karyawan[];
  attendance: Absensi[];
  present: number;
  late: number;
  payroll: number;
  onNavigate: (menu: string) => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: string;
}

function StatCard({
  label,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e7eaf0',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            fontSize: 20,
          }}
        >
          {icon}
        </span>

        <span
          style={{
            fontSize: 12,
            color: '#667085',
          }}
        >
          HRIS
        </span>
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#667085',
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 30,
          lineHeight: 1.1,
          fontWeight: 800,
          color: '#172033',
          marginBottom: 6,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          color: '#667085',
        }}
      >
        {description}
      </div>
    </div>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function QuickAction({
  label,
  description,
  icon,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#ffffff',
        border: '1px solid #e7eaf0',
        borderRadius: 14,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          fontSize: 18,
        }}
      >
        {icon}
      </span>

      <span style={{ display: 'block' }}>
        <strong
          style={{
            display: 'block',
            fontSize: 14,
            color: '#172033',
            marginBottom: 3,
          }}
        >
          {label}
        </strong>

        <small
          style={{
            display: 'block',
            fontSize: 12,
            color: '#667085',
          }}
        >
          {description}
        </small>
      </span>
    </button>
  );
}

function DashboardHeader({
  title,
  description,
  role,
}: {
  title: string;
  description: string;
  role: string;
}) {
  return (
    <div
      style={{
        marginBottom: 22,
        padding: 24,
        borderRadius: 18,
        background:
          'linear-gradient(135deg, #172033 0%, #24324d 100%)',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              opacity: 0.7,
              marginBottom: 7,
            }}
          >
            MOONXPROJECT • HR COMMAND CENTER
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 13,
              opacity: 0.78,
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            padding: '9px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {role}
        </div>
      </div>
    </div>
  );
}

function WorkforceOverview({
  employees,
  attendance,
  present,
  late,
}: {
  employees: Karyawan[];
  attendance: Absensi[];
  present: number;
  late: number;
}) {
  const totalEmployees = employees.length;
  const totalAttendance = attendance.length;

  const attendanceRate =
    totalEmployees > 0
      ? Math.min(
          100,
          Math.round((present / totalEmployees) * 100)
        )
      : 0;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e7eaf0',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: '#172033',
            }}
          >
            Workforce Overview
          </h3>

          <p
            style={{
              margin: '5px 0 0',
              fontSize: 12,
              color: '#667085',
            }}
          >
            Ringkasan kondisi tenaga kerja
          </p>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#2563eb',
          }}
        >
          Hari ini
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 15,
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#667085',
              marginBottom: 6,
            }}
          >
            Total Karyawan
          </div>

          <strong
            style={{
              fontSize: 23,
              color: '#172033',
            }}
          >
            {totalEmployees}
          </strong>
        </div>

        <div
          style={{
            padding: 15,
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#667085',
              marginBottom: 6,
            }}
          >
            Hadir
          </div>

          <strong
            style={{
              fontSize: 23,
              color: '#159447',
            }}
          >
            {present}
          </strong>
        </div>

        <div
          style={{
            padding: 15,
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#667085',
              marginBottom: 6,
            }}
          >
            Terlambat
          </div>

          <strong
            style={{
              fontSize: 23,
              color: '#d97706',
            }}
          >
            {late}
          </strong>
        </div>

        <div
          style={{
            padding: 15,
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#667085',
              marginBottom: 6,
            }}
          >
            Attendance Rate
          </div>

          <strong
            style={{
              fontSize: 23,
              color: '#2563eb',
            }}
          >
            {attendanceRate}%
          </strong>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 15,
          borderTop: '1px solid #e7eaf0',
          fontSize: 12,
          color: '#667085',
        }}
      >
        Total record absensi: <strong>{totalAttendance}</strong>
      </div>
    </div>
  );
}

function RestrictedDashboard({
  role,
}: {
  role: string;
}) {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 18,
        border: '1px solid #e7eaf0',
        background: '#ffffff',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 38, marginBottom: 10 }}>
        🔒
      </div>

      <h2
        style={{
          margin: 0,
          color: '#172033',
        }}
      >
        Dashboard Terbatas
      </h2>

      <p
        style={{
          color: '#667085',
          fontSize: 13,
        }}
      >
        Role <strong>{role}</strong> belum memiliki
        konfigurasi dashboard khusus.
      </p>
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
}: RoleDashboardProps) {
  return (
    <>
      <DashboardHeader
        title="Super Admin Dashboard"
        description="Kontrol penuh terhadap sistem HRIS, pengguna, data, keamanan, dan konfigurasi."
        role="Super Admin"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <StatCard
          label="Total Karyawan"
          value={employees.length}
          description="Seluruh workforce"
          icon="👥"
        />

        <StatCard
          label="Hadir Hari Ini"
          value={present}
          description="Attendance aktif"
          icon="✓"
        />

        <StatCard
          label="Terlambat"
          value={late}
          description="Perlu monitoring"
          icon="◷"
        />

        <StatCard
          label="Payroll"
          value={payroll}
          description="Data payroll"
          icon="Rp"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.5fr) minmax(280px, 1fr)',
          gap: 18,
        }}
      >
        <WorkforceOverview
          employees={employees}
          attendance={attendance}
          present={present}
          late={late}
        />

        <div>
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: 16,
              color: '#172033',
            }}
          >
            Quick Actions
          </h3>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <QuickAction
              label="Kelola Karyawan"
              description="Master data workforce"
              icon="👥"
              onClick={() => onNavigate('employees')}
            />

            <QuickAction
              label="Audit Log"
              description="Aktivitas sistem"
              icon="◉"
              onClick={() => onNavigate('audit')}
            />

            <QuickAction
              label="Settings"
              description="Konfigurasi sistem"
              icon="⚙"
              onClick={() => onNavigate('settings')}
            />
          </div>
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
}: RoleDashboardProps) {
  return (
    <>
      <DashboardHeader
        title="Admin Dashboard"
        description="Kelola operasional HR, karyawan, absensi, jadwal, dan laporan."
        role="Admin"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <StatCard
          label="Karyawan"
          value={employees.length}
          description="Data aktif"
          icon="👥"
        />

        <StatCard
          label="Hadir"
          value={present}
          description="Hari ini"
          icon="✓"
        />

        <StatCard
          label="Terlambat"
          value={late}
          description="Hari ini"
          icon="◷"
        />

        <StatCard
          label="Payroll"
          value={payroll}
          description="Data payroll"
          icon="Rp"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.5fr) minmax(280px, 1fr)',
          gap: 18,
        }}
      >
        <WorkforceOverview
          employees={employees}
          attendance={attendance}
          present={present}
          late={late}
        />

        <div>
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: 16,
              color: '#172033',
            }}
          >
            Operasional
          </h3>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <QuickAction
              label="Karyawan"
              description="Kelola data karyawan"
              icon="👥"
              onClick={() => onNavigate('employees')}
            />

            <QuickAction
              label="Absensi"
              description="Monitoring kehadiran"
              icon="✓"
              onClick={() => onNavigate('attendance')}
            />

            <QuickAction
              label="Jadwal"
              description="Kelola jadwal kerja"
              icon="▦"
              onClick={() => onNavigate('schedule')}
            />

            <QuickAction
              label="Laporan"
              description="Lihat laporan HR"
              icon="▤"
              onClick={() => onNavigate('reports')}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function HRDDashboard({
  employees,
  attendance,
  present,
  late,
  payroll,
  onNavigate,
}: RoleDashboardProps) {
  return (
    <>
      <DashboardHeader
        title="HRD Dashboard"
        description="Monitoring workforce, absensi, cuti, talent management, dan kebutuhan HR."
        role="HRD"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <StatCard
          label="Total Karyawan"
          value={employees.length}
          description="Workforce"
          icon="👥"
        />

        <StatCard
          label="Hadir"
          value={present}
          description="Hari ini"
          icon="✓"
        />

        <StatCard
          label="Terlambat"
          value={late}
          description="Perlu tindak lanjut"
          icon="◷"
        />

        <StatCard
          label="Payroll"
          value={payroll}
          description="Informasi payroll"
          icon="Rp"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.5fr) minmax(280px, 1fr)',
          gap: 18,
        }}
      >
        <WorkforceOverview
          employees={employees}
          attendance={attendance}
          present={present}
          late={late}
        />

        <div>
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: 16,
              color: '#172033',
            }}
          >
            HR Management
          </h3>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <QuickAction
              label="Employee Master"
              description="Kelola data karyawan"
              icon="👥"
              onClick={() => onNavigate('employees')}
            />

            <QuickAction
              label="Attendance"
              description="Monitoring kehadiran"
              icon="✓"
              onClick={() => onNavigate('attendance')}
            />

            <QuickAction
              label="Leave"
              description="Kelola cuti dan approval"
              icon="▣"
              onClick={() => onNavigate('leave')}
            />

            <QuickAction
              label="Talent"
              description="Talent management"
              icon="★"
              onClick={() => onNavigate('talent')}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function RoleDashboard({
  role,
  employees,
  attendance,
  present,
  late,
  payroll,
  onNavigate,
}: RoleDashboardProps) {
  const normalizedRole = String(role || '').trim();

  if (normalizedRole === 'Super Admin') {
    return (
      <SuperAdminDashboard
        role={role}
        employees={employees}
        attendance={attendance}
        present={present}
        late={late}
        payroll={payroll}
        onNavigate={onNavigate}
      />
    );
  }

  if (normalizedRole === 'Admin') {
    return (
      <AdminDashboard
        role={role}
        employees={employees}
        attendance={attendance}
        present={present}
        late={late}
        payroll={payroll}
        onNavigate={onNavigate}
      />
    );
  }

  if (normalizedRole === 'HRD') {
    return (
      <HRDDashboard
        role={role}
        employees={employees}
        attendance={attendance}
        present={present}
        late={late}
        payroll={payroll}
        onNavigate={onNavigate}
      />
    );
  }

  return <RestrictedDashboard role={normalizedRole || 'Unknown'} />;
}
