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
                erro: error.message
            });
        }

        if (data === null) {
            return res.status(404).json({
                erro: error.message
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            erro: error.message
        });
    }
}

export async function deleteRestaurant(req, res) {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase.rpc(
            'delete_restaurant',
            {
                p_id: id
            }
        );

        if (error) {
            return res.status(400).json({
                erro: error.message
            });
        }
        
        if (data == null) {
            return res.status(404).json({
                erro: error.message
            });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            erro: error.message
        });
    }
}


// return points in the visible are of the map
export async function restaurantsOnMap(req, res) {
    try {
        const { north, south, east, west } = req.query;

        const bounds = {
            north: Number(north),
            south: Number(south),
            east: Number(east),
            west: Number(west)
        };

        // add error messages later
        if (Object.values(bounds).some(value => !Number.isFinite(value))) {
            return res.status(400).json({
            });
        }

        if (bounds.north <= bounds.south || bounds.east <= bounds.west) {
            return res.status(400).json({
            });
        }

        const { data, error } = await supabase.rpc(
            'restaurants_on_map',
            {
                north: bounds.north,
                south: bounds.south,
                east: bounds.east,
                west: bounds.west
            }
        );

        if (error) {
            return res.status(400).json({
                erro: error.message
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            erro: error.message
        });
    }
}