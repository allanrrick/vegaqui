import supabase from '../database/supabase.js';

export async function listRestaurants(req, res) {
    const { data, error } = await supabase
        .from('restaurant')
        .select(`
            id,
            name,
            description,
            type,
            adress,
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
            adress,
            latitude,
            longitude
        } = req.body;

        const { data, error } = await supabase.rpc(
            'create_restaurant',
            {
                p_name: name,
                p_description: description,
                p_type: type,
                p_adress: adress,
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