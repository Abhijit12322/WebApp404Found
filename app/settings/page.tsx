'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import DashboardNav from '@/components/dashboard/dashboard-nav';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState({
        alerts_enabled: true,
        email_notifications: true,
        live_monitoring_enabled: false,
        preferred_language: 'en',
        timezone: 'UTC',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user?.id)
                .maybeSingle();

            if (data) {
                setSettings({
                    alerts_enabled: data.alerts_enabled,
                    email_notifications: data.email_notifications,
                    live_monitoring_enabled: data.live_monitoring_enabled,
                    preferred_language: data.preferred_language,
                    timezone: data.timezone,
                });
            } else {
                // Create default settings if they don't exist
                await supabase.from('user_settings').insert({
                    user_id: user?.id,
                    alerts_enabled: true,
                    email_notifications: true,
                    live_monitoring_enabled: false,
                    preferred_language: 'en',
                    timezone: 'UTC',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('user_settings')
                .update(settings)
                .eq('user_id', user?.id);

            if (error) throw error;
            toast.success('Settings saved successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <DashboardNav user={user} />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your WildGuard AI preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Notifications */}
                    <Card className="border-slate-700 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Notifications</CardTitle>
                            <CardDescription>Control how you receive alerts and updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-white">Alerts Enabled</Label>
                                    <p className="text-sm text-slate-400">Receive danger alerts from detections</p>
                                </div>
                                <Switch
                                    checked={settings.alerts_enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, alerts_enabled: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-white">Email Notifications</Label>
                                    <p className="text-sm text-slate-400">Send notifications to your email</p>
                                </div>
                                <Switch
                                    checked={settings.email_notifications}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, email_notifications: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-white">Live Monitoring</Label>
                                    <p className="text-sm text-slate-400">Enable continuous live stream monitoring</p>
                                </div>
                                <Switch
                                    checked={settings.live_monitoring_enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, live_monitoring_enabled: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="border-slate-700 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Preferences</CardTitle>
                            <CardDescription>Configure your regional and language settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Preferred Language</Label>
                                <Select
                                    value={settings.preferred_language}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, preferred_language: value })
                                    }
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-600">
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="de">Deutsch</SelectItem>
                                        <SelectItem value="zh">中文</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Timezone</Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, timezone: value })
                                    }
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-600">
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="EST">EST (Eastern)</SelectItem>
                                        <SelectItem value="CST">CST (Central)</SelectItem>
                                        <SelectItem value="MST">MST (Mountain)</SelectItem>
                                        <SelectItem value="PST">PST (Pacific)</SelectItem>
                                        <SelectItem value="GMT">GMT (Greenwich)</SelectItem>
                                        <SelectItem value="CET">CET (Central Europe)</SelectItem>
                                        <SelectItem value="IST">IST (India)</SelectItem>
                                        <SelectItem value="JST">JST (Japan)</SelectItem>
                                        <SelectItem value="AEST">AEST (Australia)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account */}
                    <Card className="border-slate-700 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Account</CardTitle>
                            <CardDescription>Your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Email Address</Label>
                                <Input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-slate-800 border-slate-600 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Save className="w-4 h-4 mr-2" />
                            Save Settings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
