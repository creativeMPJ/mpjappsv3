import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Building2, CreditCard, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SuperAdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Bank settings
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  
  // Price settings
  const [registrationPrice, setRegistrationPrice] = useState("");
  const [claimPrice, setClaimPrice] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'bank_name', 
          'bank_account_number', 
          'bank_account_name',
          'registration_base_price',
          'claim_base_price'
        ]);

      if (error) throw error;

      if (data) {
        data.forEach(setting => {
          const value = String(setting.value).replace(/"/g, '');
          switch (setting.key) {
            case 'bank_name':
              setBankName(value);
              break;
            case 'bank_account_number':
              setBankAccountNumber(value);
              break;
            case 'bank_account_name':
              setBankAccountName(value);
              break;
            case 'registration_base_price':
              setRegistrationPrice(value);
              break;
            case 'claim_base_price':
              setClaimPrice(value);
              break;
          }
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankSettings = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'bank_name', value: JSON.stringify(bankName), description: 'Nama bank untuk pembayaran' },
        { key: 'bank_account_number', value: JSON.stringify(bankAccountNumber), description: 'Nomor rekening bank untuk pembayaran' },
        { key: 'bank_account_name', value: JSON.stringify(bankAccountName), description: 'Nama pemilik rekening bank' },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: update.key, 
            value: update.value,
            description: update.description,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: "Pengaturan bank berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Error saving bank settings:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePriceSettings = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'registration_base_price', value: registrationPrice, description: 'Harga dasar pendaftaran pesantren baru' },
        { key: 'claim_base_price', value: claimPrice, description: 'Harga dasar klaim akun legacy' },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: update.key, 
            value: update.value,
            description: update.description,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: "Pengaturan harga berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Error saving price settings:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola pengaturan bank dan harga pendaftaran</p>
      </div>

      <Tabs defaultValue="bank" className="space-y-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Rekening Bank
          </TabsTrigger>
          <TabsTrigger value="price" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Harga Pendaftaran
          </TabsTrigger>
        </TabsList>

        {/* Bank Settings */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pengaturan Rekening Bank
              </CardTitle>
              <CardDescription>
                Informasi rekening yang akan ditampilkan pada halaman pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Bank</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Rekening</Label>
                <Input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Contoh: 7171234567890"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Nama Pemilik Rekening</Label>
                <Input
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Contoh: MEDIA PONDOK JAWA TIMUR"
                />
              </div>
              <Button 
                onClick={handleSaveBankSettings} 
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Pengaturan Bank
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Settings */}
        <TabsContent value="price">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pengaturan Harga
              </CardTitle>
              <CardDescription>
                Harga dasar untuk pendaftaran baru dan klaim akun legacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Harga Pendaftaran Pesantren Baru (Rp)</Label>
                <Input
                  type="number"
                  value={registrationPrice}
                  onChange={(e) => setRegistrationPrice(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">Harga untuk jalur pendaftaran pesantren baru</p>
              </div>
              <div className="space-y-2">
                <Label>Harga Klaim Akun Legacy (Rp)</Label>
                <Input
                  type="number"
                  value={claimPrice}
                  onChange={(e) => setClaimPrice(e.target.value)}
                  placeholder="Contoh: 20000"
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">Harga untuk jalur klaim akun dari sistem lama</p>
              </div>
              <Button 
                onClick={handleSavePriceSettings} 
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Pengaturan Harga
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminSettings;
