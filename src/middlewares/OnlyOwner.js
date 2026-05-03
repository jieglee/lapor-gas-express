import { supabase } from "../config/supabase"

async function OnlyOwnerReport(req, res, next) {
    try {
    const userId = req.user.userId
    const reportId = req.params.id

    const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single()

    if (!data) {
        return res.status(404).json ({ message: "Data Not Found" })
    }

    if (req.user.role === "superadmin"){
        return next ()
    }

    if (data.user_id !== userId) {
        return res.status(403).json ({ message: "Not Your Data" })
    }
    next()

    } catch (error) {
        return req.status(500).json ({ message: error.message })

    }
}


export {OnlyOwnerReport}