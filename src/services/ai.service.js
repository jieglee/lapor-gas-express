const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const CATEGORY_MAP = {
    Infrastruktur: 1,
    "Fasilitas Umum": 2,
    Kebersihan: 3,
    "Lalu Lintas": 4,
};

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

const SYSTEM_PROMPT = `
Kamu adalah AI classifier untuk platform pengaduan masyarakat Indonesia bernama LaporGas.

Tentukan:
1. category
2. priority

Format JSON saja:

{"category":"...","priority":"...","confidence":0.0}
`;

async function categorizeReport(title, description) {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: "user",
                        content: `Judul: ${title}\nDeskripsi: ${description}`,
                    },
                ],
                stream: false,
            }),
        });

        if (!res.ok) {
            throw new Error(`Ollama error: ${res.status}`);
        }

        const data = await res.json();
        const content = data?.message?.content || "";

        const jsonMatch = content.match(/\{[\s\S]*?\}/);

        if (!jsonMatch) {
            throw new Error("No JSON found");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        const category_id =
            CATEGORY_MAP[parsed.category] || 2;

        const priority = VALID_PRIORITIES.includes(
            String(parsed.priority).toLowerCase()
        )
            ? String(parsed.priority).toLowerCase()
            : "medium";

        let confidence = Number(parsed.confidence);

        if (!confidence || Number.isNaN(confidence)) {
            confidence = 0.75;
        }

        return {
            category_id,
            priority,
            confidence,
        };
    } catch (error) {
        console.error("AI categorization failed:", error);

        return {
            category_id: 2,
            priority: "medium",
            confidence: 0,
        };
    }
}

module.exports = {
    categorizeReport,
};
