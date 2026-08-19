import { useEffect, useState } from "react";
import { getVehicles } from "../services/vehicleService";
import { createBooking } from "../services/bookingService";

function CreateBooking() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    pickupDate: "",
    returnDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data.filter((vehicle) => vehicle.isAvailable));
    } catch (error) {
      console.error(error);
      setMessage("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!form.customerId || !form.vehicleId) {
      setMessage("Please select a customer and vehicle.");
      return;
    }

    if (!form.pickupDate || !form.returnDate) {
      setMessage("Please select pickup and return dates.");
      return;
    }

    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      setMessage("Return date must be after pickup date.");
      return;
    }

    try {
      setSaving(true);

      await createBooking({
        customerId: Number(form.customerId),
        vehicleId: Number(form.vehicleId),
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
      });

      setMessage("Booking created successfully!");

      setForm({
        customerId: "",
        vehicleId: "",
        pickupDate: "",
        returnDate: "",
      });

      await loadVehicles();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create booking."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading vehicles...</p>;
  }

  return (
    <div>
      <h1>Create Booking</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer ID</label>

          <input
            type="number"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            placeholder="Enter customer ID"
          />
        </div>

        <div>
          <label>Vehicle</label>

          <select
            name="vehicleId"
            value={form.vehicleId}
            onChange={handleChange}
          >
            <option value="">Select vehicle</option>

            {vehicles.map((vehicle) => (
              <option
                key={vehicle.id}
                value={vehicle.id}
              >
                {vehicle.make} {vehicle.model} - {vehicle.vehicleType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Pickup Date</label>

          <input
            type="date"
            name="pickupDate"
            value={form.pickupDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Return Date</label>

          <input
            type="date"
            name="returnDate"
            value={form.returnDate}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Booking"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateBooking;