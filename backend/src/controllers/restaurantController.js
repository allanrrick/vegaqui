import supabase from '../database/supabase.js';

export async function listRestaurants(req, res) {
    const { data, error } = await supabase
        .from('restaurant')
        .select(`
            id,
            name,
            description,
            type,
            address,
            location
        `);

    if (error) {
        return res.status(500).json({
            erro: error.message
        });
    }
    return res.status(200).json(data);
}

export async function createRestaurant(req, res) {
    try {
        const {
            name,
            description,
            type,
            address,
            latitude,
            longitude
        } = req.body;

        const { data, error } = await supabase.rpc(
            'create_restaurant',
            {
                p_name: name,
                p_description: description,
                p_type: type,
                p_address: address,
                p_latitude: latitude,
                p_longitude: longitude
            }
        );

        if (error) {
            return res.status(400).json({
                erro: error.message
            });
        }

        return res.status(201).json(data);

    } catch (error) {
        return res.status(500).json({
            erro: error.message
        });
    }
}

export async function updateRestaurant(req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            type,
            address,
            latitude,
            longitude
        } = req.body;

        const { data, error } = await supabase.rpc(
            'update_restaurant',
            {
                p_id: id,
                p_name: name,
                p_description: description,
                p_type: type,
                p_address: address,
                p_latitude: latitude,
                p_longitude: longitude
            }
        );

        if (error) {
            return res.status(400).json({
            });
        }

        if (data === null) {
            return res.status(404).json({
            });
        }

        return res.status(200).json({
        });

    } catch (error) {
        return res.status(500).json({
        });
    }
}