import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserRole,
    deleteUser,
    updateProfile
} from "../services/user.service.js"

export async function handleGetUsers(req, res) {
    try {
        const data = await getAllUsers()
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleGetUserById(req, res) {
    try {
        const data = await getUserById(req.params.id)

        if (!data) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleCreateUser(req, res) {
    try {
        const { name, email, password } = req.body
        const data = await createUser({ name, email, password })

        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleUpdateRole(req, res) {
    try {
        const data = await updateUserRole(req.params.id, req.body.role)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleDeleteUser(req, res) {
    try {
        await deleteUser(req.params.id)
        res.json({ message: "User deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleUpdateProfile(req, res) {
    try {
        const { name, email, password } = req.body
        const data = await updateProfile(req.user.id, { name, email, password })
        res.json(data)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}