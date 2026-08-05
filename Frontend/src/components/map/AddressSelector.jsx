import { useMemo } from "react";
import addressData from "../../data/nepalAddress.json";

const AddressSelector = ({ formData, setFormData }) => {

    // Provinces
    const provinces = addressData;

    // Selected Province
    const selectedProvince = useMemo(() => {
        return provinces.find(
            p => p.name === formData.province
        );
    }, [formData.province]);

    // Districts
    const districts = selectedProvince
        ? Object.values(selectedProvince.districts)
        : [];

    // Selected District
    const selectedDistrict = useMemo(() => {
        return districts.find(
            d => d.name === formData.district
        );
    }, [formData.district, districts]);

    // Municipalities
    const municipalities = selectedDistrict
        ? Object.values(selectedDistrict.municipalities)
        : [];

    // Selected Municipality
    const selectedMunicipality = useMemo(() => {
        return municipalities.find(
            m => m.name === formData.municipality
        );
    }, [formData.municipality, municipalities]);

    // Wards
    const wards = selectedMunicipality
        ? selectedMunicipality.wards
        : [];

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => {

            let updated = {
                ...prev,
                [name]: value,
            };

            if (name === "province") {
                updated.district = "";
                updated.municipality = "";
                updated.wardNo = "";
            }

            if (name === "district") {
                updated.municipality = "";
                updated.wardNo = "";
            }

            if (name === "municipality") {
                updated.wardNo = "";
            }

            return updated;
        });
    };

    return (
        <div className="space-y-3">

            <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full border p-2 rounded"
            >
                <option value="">
                    Select Province
                </option>

                {provinces.map(province => (

                    <option
                        key={province.id}
                        value={province.name}
                    >
                        {province.name}
                    </option>

                ))}

            </select>

            <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled={!formData.province}
            >

                <option value="">
                    Select District
                </option>

                {districts.map(district => (

                    <option
                        key={district.id}
                        value={district.name}
                    >
                        {district.name}
                    </option>

                ))}

            </select>

            <select
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled={!formData.district}
            >

                <option value="">
                    Select Municipality
                </option>

                {municipalities.map(municipality => (

                    <option
                        key={municipality.id}
                        value={municipality.name}
                    >
                        {municipality.name}
                    </option>

                ))}

            </select>

            <select
                name="wardNo"
                value={formData.wardNo}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                disabled={!formData.municipality}
            >

                <option value="">
                    Select Ward
                </option>

                {wards.map(ward => (

                    <option
                        key={ward}
                        value={ward}
                    >
                        Ward {ward}
                    </option>

                ))}

            </select>

            <input
                name="tole"
                placeholder="Tole / Area"
                value={formData.tole}
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

          
        </div>
    );

};

export default AddressSelector;