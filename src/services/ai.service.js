const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const CATEGORY_MAP = {
    "Infrastruktur":  "1",
    "Fasilitas Umum": "2",
    "Kebersihan":     "3",
    "Lalu Lintas":    "4",
};

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

const SYSTEM_PROMPT = `Kamu adalah AI classifier untuk platform pengaduan masyarakat Indonesia bernama LaporGas.

Tugasmu: dari judul dan deskripsi laporan, tentukan KATEGORI dan PRIORITAS.

KATEGORI yang tersedia (pilih SATU):
- Infrastruktur (jalan rusak, jembatan, gorong-gorong, trotoar, penerangan jalan)
- Fasilitas Umum (taman rusak, bangku rusak, toilet umum, halte, lampu taman)
- Kebersihan (sampah menumpuk, got mampet, drainase, limbah, sanitasi)
- Lalu Lintas (kemacetan, rambu rusak, marka jalan, parkir liar)

PRIORITAS:
- urgent: berbahaya/darurat, mengancam keselamatan jiwa
- high: berbahaya, butuh penanganan segera
- medium: mengganggu tapi tidak berbahaya langsung
- low: tidak urgent, kosmetik

RESPONS dalam format JSON SAJA, tanpa markdown, tanpa penjelasan:
{"category":"...","priority":"...","confidence":0.0}`;

export async function categorizeReport(title, description) {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `Judul: ${title}\nDeskripsi: ${description}` },
                ],
                stream: false,
                options: { temperature: 0.1, num_predict: 100 },
            }),
        });

        if (!res.ok) throw new Error(`Ollama error: ${res.status}`);

        const data = await res.json();
        const content = data?.message?.content || "";

        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) throw new Error("No JSON found");

        const parsed = JSON.parse(jsonMatch[0]);

        const category_id = CATEGORY_MAP[parsed.category] ?? "";

        const priority = VALID_PRIORITIES.includes(
            String(parsed.priority).toLowerCase()
        ) ? String(parsed.priority).toLowerCase() : "medium";

        let confidence = Number(parsed.confidence);
        if (!confidence || isNaN(confidence) || confidence === 0) {
            confidence = category_id ? 0.75 : 0.5;
        }

        return { category_id, priority, confidence };
    } catch (error) {
        console.error("AI categorization failed:", error);
        return { category_id: "", priority: "medium", confidence: 0 };
    }
}
