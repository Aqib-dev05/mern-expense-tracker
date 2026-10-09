import { useEffect, useRef, useState } from 'react';
import { Camera, Moon, Sun, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Select from '../components/ui/Select.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CURRENCIES, DATE_FORMATS } from '../constants/index.js';
import { useAuth } from '../store/AuthContext.jsx';
import { usePreferences } from '../store/PreferencesContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { fileToAvatarDataUrl } from '../utils/image.js';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme, dateFormat, setDateFormat } = usePreferences();
  const toast = useToast();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({ name: user.name, email: user.email, avatar: user.avatar || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState(user.currency);
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => { setCurrency(user.currency); }, [user.currency]);

  const dirty = profile.name !== user.name || profile.email !== user.email || profile.avatar !== (user.avatar || '');

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setProfile((p) => ({ ...p, avatar: dataUrl }));
    } catch (err) { toast.error(err.message); }
  };

  const saveProfile = async (ev) => {
    ev.preventDefault();
    const found = {};
    if (profile.name.trim().length < 2) found.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) found.email = 'Enter a valid email address';
    if (Object.keys(found).length) return setErrors(found);

    setSaving(true);
    try {
      await updateProfile({ name: profile.name.trim(), email: profile.email.trim(), avatar: profile.avatar });
      setErrors({});
      toast.success('Profile updated');
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else if (err.status === 409) setErrors({ email: err.message });
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const saveCurrency = async (value) => {
    setCurrency(value);
    setSavingCurrency(true);
    try {
      await updateProfile({ currency: value });
      toast.success('Currency updated');
    } catch (err) {
      setCurrency(user.currency);
      toast.error(err.message);
    } finally { setSavingCurrency(false); }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and appearance." />

      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Profile" subtitle="Your name, email and photo." />
          <form onSubmit={saveProfile} noValidate className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar user={{ name: profile.name, avatar: profile.avatar }} size="lg" />
              <div className="flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickAvatar} />
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Camera className="h-4 w-4" /> Upload photo</Button>
                {profile.avatar && (
                  <Button variant="ghost" size="sm" onClick={() => setProfile((p) => ({ ...p, avatar: '' }))}><Trash2 className="h-4 w-4" /> Remove</Button>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} error={errors.name} autoComplete="name" />
              <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} error={errors.email} autoComplete="email" />
            </div>
            {errors.avatar && <p className="text-xs font-medium text-rose-600">{errors.avatar}</p>}
            <div className="flex justify-end">
              <Button type="submit" loading={saving} disabled={!dirty}>Save profile</Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Preferences" subtitle="How amounts and dates are displayed." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Currency" options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
              value={currency} onChange={(e) => saveCurrency(e.target.value)} disabled={savingCurrency}
              hint="Only changes how amounts are shown; stored values aren’t converted."
            />
            <Select label="Date format" options={DATE_FORMATS} value={dateFormat} onChange={(e) => { setDateFormat(e.target.value); toast.success('Date format updated'); }} hint="Saved on this device." />
          </div>
        </Card>

        <Card>
          <CardHeader title="Appearance" subtitle="Your choice is remembered on this device." />
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
            {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }].map(({ value, label, icon: Icon }) => (
              <button
                key={value} role="radio" aria-checked={theme === value} onClick={() => setTheme(value)}
                className={`flex h-14 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  theme === value
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-ink-700 dark:text-slate-300 dark:hover:bg-ink-800'
                }`}
              >
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
