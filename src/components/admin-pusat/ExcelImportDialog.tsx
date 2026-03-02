import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type ImportType = "pesantren" | "media" | "kru";

interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: ImportType;
    onImportComplete: () => void;
}

const TYPE_LABELS: Record<ImportType, string> = {
    pesantren: "Data Pesantren",
    media: "Data Media",
    kru: "Data Kru",
};

const REQUIRED_COLUMNS: Record<ImportType, string[]> = {
    pesantren: ["NIP", "Nama Pesantren"],
    media: ["NIP", "Nama Pesantren"],
    kru: ["NIAM", "Nama Kru"],
};

const ExcelImportDialog = ({ open, onOpenChange, type, onImportComplete }: Props) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [fileName, setFileName] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [parseError, setParseError] = useState("");

    const reset = () => {
        setParsedRows([]);
        setColumns([]);
        setFileName("");
        setImportResult(null);
        setParseError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setParseError("");
        setImportResult(null);
        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

            if (json.length === 0) {
                setParseError("File Excel kosong atau tidak memiliki data.");
                return;
            }

            const cols = Object.keys(json[0]);
            const required = REQUIRED_COLUMNS[type];
            const missing = required.filter(rc => !cols.some(c => c.toLowerCase() === rc.toLowerCase()));

            if (missing.length > 0) {
                setParseError(`Kolom wajib tidak ditemukan: ${missing.join(", ")}. Pastikan file sesuai format export.`);
                return;
            }

            setColumns(cols);
            setParsedRows(json);
        } catch {
            setParseError("Gagal membaca file. Pastikan file berformat .xlsx atau .xls.");
        }
    };

    const handleImport = async () => {
        if (parsedRows.length === 0) return;
        setIsImporting(true);
        setImportResult(null);

        try {
            const result = await apiRequest<ImportResult>("/api/admin/master-data/import", {
                method: "POST",
                body: JSON.stringify({ type, rows: parsedRows }),
            });

            setImportResult(result);

            if (result.imported > 0) {
                toast({
                    title: "Import Berhasil",
                    description: `${result.imported} data berhasil diupdate${result.skipped > 0 ? `, ${result.skipped} dilewati` : ""}.`,
                });
                onImportComplete();
            } else {
                toast({
                    title: "Tidak Ada Data Diupdate",
                    description: result.errors.length > 0 ? result.errors[0] : "Tidak ada data yang cocok untuk diimport.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({ title: "Import Gagal", description: error.message, variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    };

    const previewRows = parsedRows.slice(0, 5);
    const previewCols = columns.slice(0, 6);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                        Import {TYPE_LABELS[type]}
                    </DialogTitle>
                    <DialogDescription>
                        Upload file Excel (.xlsx) untuk mengupdate data. Hanya data dengan NIP/NIAM yang cocok yang akan diupdate.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* File Upload Area */}
                    {!importResult && (
                        <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                            {fileName ? (
                                <div>
                                    <p className="font-medium text-foreground">{fileName}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {parsedRows.length} baris data ditemukan
                                    </p>
                                    <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-1">
                                        Ganti file
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-foreground">Klik untuk upload file Excel</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: .xlsx atau .xls · Kolom wajib: {REQUIRED_COLUMNS[type].join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Parse Error */}
                    {parseError && (
                        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <p className="text-destructive">{parseError}</p>
                        </div>
                    )}

                    {/* Preview Table */}
                    {parsedRows.length > 0 && !importResult && (
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Preview Data ({Math.min(5, parsedRows.length)} dari {parsedRows.length} baris)
                            </p>
                            <div className="overflow-x-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs w-10">#</TableHead>
                                            {previewCols.map((col) => (
                                                <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                                            ))}
                                            {columns.length > 6 && <TableHead className="text-xs">...</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewRows.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                                                {previewCols.map((col) => (
                                                    <TableCell key={col} className="text-xs max-w-[150px] truncate">
                                                        {String(row[col] ?? "")}
                                                    </TableCell>
                                                ))}
                                                {columns.length > 6 && <TableCell className="text-xs text-muted-foreground">...</TableCell>}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Import Result */}
                    {importResult && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <p className="font-semibold text-foreground">Import Selesai</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="text-emerald-600 font-medium">{importResult.imported} berhasil</span>
                                        {importResult.skipped > 0 && (
                                            <span className="text-amber-600 font-medium"> · {importResult.skipped} dilewati</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Detail Error:</p>
                                    <div className="max-h-32 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-3">
                                        {importResult.errors.map((err, idx) => (
                                            <p key={idx} className="text-xs text-destructive">{err}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    {importResult ? (
                        <Button onClick={() => handleClose(false)}>Tutup</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => handleClose(false)}>Batal</Button>
                            <Button
                                onClick={handleImport}
                                disabled={parsedRows.length === 0 || isImporting || !!parseError}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isImporting ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Mengimport...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import {parsedRows.length} Data
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExcelImportDialog;
