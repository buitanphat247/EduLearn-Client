import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Button, Typography, Table, Tag, Checkbox, Tabs, Switch, Badge, Collapse, Space, App } from "antd";
import { SaveOutlined, ApiOutlined, LockOutlined, GlobalOutlined, RightOutlined, SafetyOutlined } from "@ant-design/icons";
import { Role } from "@/app/super-admin/permissions/types";
import { getPermissions, bulkSyncPermissions } from "@/lib/services/permissions";

import { ALL_ROUTES } from "../data/all_routes";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Memoized Card for performance
const ApiEndpointCard = React.memo(({ api, roleId, isAllowed, isDisabled, onToggle }: any) => {
  const handleChange = useCallback(() => {
    onToggle(roleId, api.id);
  }, [onToggle, roleId, api.id]);

  return (
    <div
      className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between h-28 ${isAllowed ? "bg-white border-slate-200 hover:border-blue-400" : "bg-slate-50 border-slate-100 opacity-60"
        }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          <Tag
            color={api.method === "GET" ? "blue" : api.method === "POST" ? "green" : api.method === "PATCH" ? "orange" : "red"}
            className="m-0 font-extrabold text-[9px] px-1.5 rounded-md leading-tight"
          >
            {api.method}
          </Tag>
          <span className={`text-[8px] font-bold px-1 rounded ${api.server === "nestjs" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
            {api.server}
          </span>
        </div>
        <Switch
          checked={isAllowed}
          disabled={isDisabled}
          onChange={handleChange}
          size="small"
          className={isAllowed ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : ""}
        />
      </div>

      <div className="flex-1 overflow-hidden mt-1">
        <code className="text-[11px] font-bold text-slate-700 bg-slate-50 px-1 py-0.5 rounded block truncate mb-1 border border-slate-100 italic">
          {api.path}
        </code>
      </div>

      {isAllowed && (
        <div className="absolute top-2 right-10">
          <div className="w-1 h-1 bg-green-500 rounded-full shadow-sm animate-pulse" />
        </div>
      )}
    </div>
  );
});

interface PermissionMatrixProps {
  selectedRole: Role | null;
  roles: Role[];
  modules: string[];
  actions: { key: string; label: string; color: string }[];
  onSave: () => void;
}

// Flatten scan routes outside for persistence
const scanRoutes = [
  ...ALL_ROUTES.nestjs.flatMap((item) =>
    item.methods.map((method) => ({
      path: item.path,
      method: method,
      server: "nestjs", // Match casing in DB/all_routes
      description: `Mô tả cho ${item.path}`,
    })),
  ),
  ...ALL_ROUTES.python.flatMap((item) =>
    item.methods.map((method) => ({
      path: item.path,
      method: method,
      server: "python", // Match casing in DB/all_routes
      description: `Mô tả cho ${item.path}`,
    })),
  ),
];

export default function PermissionMatrix({ selectedRole, roles, modules, actions, onSave }: PermissionMatrixProps) {
  const { message } = App.useApp();
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Set<number>>>({});
  const [isPending, startTransition] = React.useTransition();

  // Track ongoing saves and pending payloads per role
  const pendingSaves = React.useRef<Set<string>>(new Set());
  const nextSaveState = React.useRef<Record<string, number[]>>({});

  const fetchEndpoints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPermissions();
      const mapped = (data.data || data).map((p: any) => ({
        key: p.permission_id,
        id: p.permission_id,
        path: p.path,
        method: p.method,
        server: p.server,
        description: p.description,
      }));
      setEndpoints(mapped);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  useEffect(() => {
    const initialMap: Record<string, Set<number>> = {};
    roles.forEach((role) => {
      initialMap[role.id] = new Set(role.apiPermissionIds || []);
    });
    setRolePermissions(initialMap);
  }, [roles]);

  const handleSyncApis = async () => {
    try {
      setIsSyncing(true);
      await bulkSyncPermissions(scanRoutes);
      message.success(`Đã quét và đồng bộ ${scanRoutes.length} API endpoints thành công!`);
      await fetchEndpoints();
    } catch (error) {
      console.error("Error syncing APIs:", error);
      message.error("Lỗi khi đồng bộ API");
    } finally {
      setIsSyncing(false);
    }
  };

  const executeSave = useCallback(async (roleId: string, perms: number[]) => {
    if (pendingSaves.current.has(roleId)) {
      nextSaveState.current[roleId] = perms;
      return;
    }

    pendingSaves.current.add(roleId);
    try {
      const { assignPermissions } = await import("@/lib/services/permissions");
      await assignPermissions(parseInt(roleId), perms);
    } catch (error) {
      console.error("Error saving permission for role", roleId, error);
    } finally {
      pendingSaves.current.delete(roleId);
      if (nextSaveState.current[roleId]) {
        const nextPerms = nextSaveState.current[roleId];
        delete nextSaveState.current[roleId];
        setTimeout(() => executeSave(roleId, nextPerms), 100);
      }
    }
  }, []);

  const handleToggleAll = useCallback(
    (roleId: string, enable: boolean) => {
      const newPermsList = enable ? endpoints.map((e) => e.id) : [];
      const newPermsSet = new Set(newPermsList);

      startTransition(() => {
        setRolePermissions((prev) => ({ ...prev, [roleId]: newPermsSet }));
      });

      executeSave(roleId, newPermsList);
    },
    [endpoints, executeSave],
  );

  const handleTogglePermission = useCallback((roleId: string, permissionId: number) => {
    setRolePermissions(prev => {
      const currentPerms = new Set(prev[roleId] || []);
      if (currentPerms.has(permissionId)) {
        currentPerms.delete(permissionId);
      } else {
        currentPerms.add(permissionId);
      }

      const newPermsList = Array.from(currentPerms);
      executeSave(roleId, newPermsList);

      return { ...prev, [roleId]: currentPerms };
    });
  }, [executeSave]);

  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, any[]> = {
      GET: [],
      POST: [],
      PUT: [],
      PATCH: [],
      DELETE: [],
    };
    endpoints.forEach((e) => {
      const m = e.method.toUpperCase();
      if (groups[m]) groups[m].push(e);
      else groups[m] = [e];
    });
    return groups;
  }, [endpoints]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between px-2">
        <Title level={4} className="m-0 font-extrabold text-slate-800">
          Phân quyền API & Hệ thống
        </Title>
        <div className="flex gap-3">
          <Button
            icon={<ApiOutlined />}
            loading={isSyncing}
            onClick={handleSyncApis}
            className="flex items-center font-bold border-slate-300 rounded-xl h-10 px-4 text-slate-600 hover:text-blue-600 transition-all active:scale-95"
          >
            Quét & Cập nhật API
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2 pb-10">
        {endpoints.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <ApiOutlined className="text-6xl text-slate-300 mb-4" />
            <Text className="text-slate-500 font-medium text-lg">Chưa có API nào được quét</Text>
            <Text className="text-slate-400 text-sm mb-6">Hãy nhấn nút "Quét & Cập nhật API" để bắt đầu</Text>
            <Button type="primary" icon={<ApiOutlined />} onClick={handleSyncApis} loading={isSyncing}>
              Bắt đầu quét ngay
            </Button>
          </div>
        ) : (
          <div className="api-config-wrapper">
            <Collapse
              ghost
              expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} className="text-[#64748b] text-[12px]" />}
              defaultActiveKey={["1"]}
              className="permissions-collapse"
            >
              {roles.map((role: Role) => (
                <Panel
                  header={
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: role.color }}>
                          <div className="text-lg flex items-center justify-center">{role.icon}</div>
                        </div>
                        <div className="flex flex-col">
                          <Text className="font-bold text-[14px] text-slate-700 leading-tight mb-0.5">{role.name}</Text>
                          <div className="flex items-center gap-1.5 leading-none">
                            <div className={`w-1.5 h-1.5 rounded-full ${role.status === "active" ? "bg-[#22c55e]" : "bg-[#94a3b8]"}`} />
                            <Text className="text-[10px] text-[#1e293b] font-bold uppercase tracking-wide">
                              {role.status === "active" ? "ĐANG HOẠT ĐỘNG" : "TẠM KHÓA"}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Full quyền</Text>
                          <Switch
                            size="small"
                            checked={role.name === "Super Admin" || (rolePermissions[role.id]?.size === endpoints.length && endpoints.length > 0)}
                            disabled={role.name === "Super Admin"}
                            onChange={(checked) => handleToggleAll(role.id, checked)}
                            className={rolePermissions[role.id]?.size === endpoints.length ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]" : ""}
                          />
                        </div>
                        <div
                          className="px-2.5 py-1 rounded-[4px] text-[10px] font-bold tracking-tight whitespace-nowrap"
                          style={{
                            backgroundColor: `${role.color}15`,
                            color: role.color,
                            border: `1px solid ${role.color}40`,
                          }}
                        >
                          {(rolePermissions[role.id] || new Set()).size} ENDPOINTS
                        </div>
                      </div>
                    </div>
                  }
                  key={role.id}
                  className="custom-role-panel"
                >
                  <div className="bg-white border-t border-[#cbd5e1]">
                    {Object.entries(groupedEndpoints).map(([method, methodEndpoints]) => {
                      if (methodEndpoints.length === 0) return null;

                      return (
                        <div key={method} className="p-6 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-1.5 h-5 rounded-full ${method === "GET" ? "bg-blue-500" :
                                  method === "POST" ? "bg-green-500" :
                                    method === "PATCH" ? "bg-orange-500" :
                                      method === "PUT" ? "bg-cyan-500" : "bg-red-500"
                                }`}
                            />
                            <Text className="font-extrabold text-slate-800 text-[13px] tracking-wider uppercase">
                              DANH SÁCH {method} API
                            </Text>
                            <Badge
                              count={methodEndpoints.length}
                              style={{
                                backgroundColor: method === "GET" ? "#3b82f6" : method === "POST" ? "#22c55e" : method === "PATCH" ? "#f59e0b" : method === "PUT" ? "#06b6d4" : "#ef4444",
                                boxShadow: 'none'
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                            {methodEndpoints.map((api: any) => (
                              <ApiEndpointCard
                                key={`${role.id}-${api.id}`}
                                api={api}
                                roleId={role.id}
                                isAllowed={role.name === "Super Admin" || (rolePermissions[role.id]?.has(api.id) ?? false)}
                                isDisabled={role.name === "Super Admin"}
                                onToggle={handleTogglePermission}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        )}
      </div>

      <style jsx global>{`
        .permissions-collapse.ant-collapse-ghost {
          background-color: transparent !important;
          border: none !important;
        }

        .permissions-collapse .ant-collapse-item {
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 12px !important;
          margin-bottom: 20px !important;
          background: #f8fafc !important;
          overflow: hidden !important;
          box-shadow: none !important;
          transition: all 0.3s;
          display: block !important;
        }

        .permissions-collapse .ant-collapse-item:hover {
          border-color: #94a3b8 !important;
        }

        .permissions-collapse .ant-collapse-header {
          padding: 16px 20px !important;
          align-items: center !important;
        }

        .permissions-collapse .ant-collapse-content {
          background-color: white !important;
          border-top: none !important;
        }

        .permissions-collapse .ant-collapse-content-box {
          padding: 0 !important;
        }

        .permissions-collapse .ant-collapse-expand-icon {
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
}
