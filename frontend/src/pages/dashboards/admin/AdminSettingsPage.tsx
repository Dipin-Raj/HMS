import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { adminService } from "@/services/adminService";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("HMS-AI");
  const [useTls, setUseTls] = useState(true);
  const [testRecipient, setTestRecipient] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminEmailSettings"],
    queryFn: () => adminService.getMyEmailSettings(),
  });

  useEffect(() => {
    if (!data?.is_configured) return;
    setSmtpHost(data.smtp_host || "");
    setSmtpPort(String(data.smtp_port || 587));
    setSmtpUsername(data.smtp_username || "");
    setFromEmail(data.from_email || "");
    setFromName(data.from_name || "HMS-AI");
    setUseTls(Boolean(data.use_tls));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: adminService.saveMyEmailSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminEmailSettings"] });
      setSmtpPassword("");
      toast({ title: "Saved", description: "Email settings updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: (recipient: string) => adminService.sendMyEmailSettingsTest(recipient),
    onSuccess: () => {
      toast({ title: "Success", description: "Test email sent." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate({
      smtp_host: smtpHost,
      smtp_port: Number(smtpPort),
      smtp_username: smtpUsername,
      smtp_password: smtpPassword || undefined,
      from_email: fromEmail,
      from_name: fromName,
      use_tls: useTls,
    });
  };

  const onSendTest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    testMutation.mutate(testRecipient);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Mail Settings</CardTitle>
          <CardDescription>
            Configure SMTP once for this admin account. Invites use this profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading settings...</p>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input id="smtp_host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder={data?.is_configured ? "Leave blank to keep existing password" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input id="from_name" value={fromName} onChange={(e) => setFromName(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="use_tls"
                  type="checkbox"
                  checked={useTls}
                  onChange={(e) => setUseTls(e.target.checked)}
                />
                <Label htmlFor="use_tls">Use TLS</Label>
              </div>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>Verify current SMTP settings quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSendTest} className="flex gap-3">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              required
            />
            <Button type="submit" disabled={testMutation.isPending}>
              {testMutation.isPending ? "Sending..." : "Send Test"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
