import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "./services/vehicleService";
import { useEffect, useState } from "react";
import { getBookings, createBooking } from "./services/bookingService";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState(null);

  const [vehicleMessage, setVehicleMessage] = useState("");

  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    year: "",
    vehicleType: "",
    pricePerDay: "",
    isAvailable: true,
  });

  const [bookingForm, setBookingForm] = useState({
    customerId: "",
    vehicleId: "",
    pickupDate: "",
    returnDate: "",
  });

  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSaving, setBookingSaving] = useState(false);

  const loadData = async () => {
    try {
      const [vehiclesData, bookingsData] = await Promise.all([
        getVehicles(),
        getBookings(),
      ]);

      setVehicles(vehiclesData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVehicleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setVehicleForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      registrationNumber: "",
      make: "",
      model: "",
      year: "",
      vehicleType: "",
      pricePerDay: "",
      isAvailable: true,
    });

    setEditingVehicle(null);
    setShowVehicleForm(false);
    setVehicleMessage("");
  };

  const handleCreateVehicle = async (event) => {
    event.preventDefault();

    try {
      setVehicleMessage("");

      const newVehicle = {
        registrationNumber: vehicleForm.registrationNumber,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        vehicleType: vehicleForm.vehicleType,
        pricePerDay: Number(vehicleForm.pricePerDay),
        isAvailable: vehicleForm.isAvailable,
      };

      const createdVehicle = await createVehicle(newVehicle);

      setVehicles((current) => [...current, createdVehicle]);

      setVehicleMessage("Vehicle created successfully.");

      resetVehicleForm();
    } catch (error) {
      console.error("Failed to create vehicle:", error);

      setVehicleMessage(
        error.response?.data?.message || "Failed to create vehicle.",
      );
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);

    setVehicleForm({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vehicleType: vehicle.vehicleType,
      pricePerDay: vehicle.pricePerDay,
      isAvailable: vehicle.isAvailable,
    });

    setShowVehicleForm(true);
    setVehicleMessage("");
  };

  const handleUpdateVehicle = async (event) => {
    event.preventDefault();

    try {
      setVehicleMessage("");

      const updatedVehicle = {
        registrationNumber: vehicleForm.registrationNumber,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: Number(vehicleForm.year),
        vehicleType: vehicleForm.vehicleType,
        pricePerDay: Number(vehicleForm.pricePerDay),
        isAvailable: vehicleForm.isAvailable,
      };

      const result = await updateVehicle(editingVehicle.id, updatedVehicle);

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === editingVehicle.id ? result : vehicle,
        ),
      );

      setVehicleMessage("Vehicle updated successfully.");

      resetVehicleForm();
    } catch (error) {
      console.error("Failed to update vehicle:", error);

      setVehicleMessage(
        error.response?.data?.message || "Failed to update vehicle.",
      );
    }
  };

  const handleDeleteVehicle = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteVehicle(id);

      setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));

      setVehicleMessage("Vehicle deleted successfully.");
    } catch (error) {
      console.error("Failed to delete vehicle:", error);

      setVehicleMessage(
        error.response?.data?.message || "Failed to delete vehicle.",
      );
    }
  };
  const handleBookingChange = (event) => {
    const { name, value } = event.target;

    setBookingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    setBookingMessage("");

    if (
      !bookingForm.customerId ||
      !bookingForm.vehicleId ||
      !bookingForm.pickupDate ||
      !bookingForm.returnDate
    ) {
      setBookingMessage("Please fill in all fields.");
      return;
    }

    if (new Date(bookingForm.returnDate) <= new Date(bookingForm.pickupDate)) {
      setBookingMessage("Return date must be after pickup date.");
      return;
    }

    try {
      setBookingSaving(true);

      await createBooking({
        customerId: Number(bookingForm.customerId),
        vehicleId: Number(bookingForm.vehicleId),

        // Convert HTML date to ASP.NET DateTime format
        pickupDate: `${bookingForm.pickupDate}T00:00:00`,
        returnDate: `${bookingForm.returnDate}T00:00:00`,
      });

      setBookingMessage("Booking created successfully!");

      setBookingForm({
        customerId: "",
        vehicleId: "",
        pickupDate: "",
        returnDate: "",
      });

      await loadData();
    } catch (error) {
      console.error("Failed to create booking:", error);

      console.error("Backend response:", error.response?.data);

      setBookingMessage(
        error.response?.data?.message || "Failed to create booking.",
      );
    } finally {
      setBookingSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    // -------------------------
    // VEHICLES
    // -------------------------

    if (activePage === "vehicles") {
      return (
        <section>
          <div className="page-header">
            <div>
              <h1>Vehicles</h1>
              <p className="welcome">Manage your rental vehicles.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setEditingVehicle(null);
                setShowVehicleForm(true);
                setVehicleMessage("");
              }}
            >
              + Add Vehicle
            </button>
          </div>

          {vehicleMessage && (
            <div className="form-message">{vehicleMessage}</div>
          )}

          {showVehicleForm && (
            <div className="form-card">
              <h2>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>

              <form
                onSubmit={
                  editingVehicle ? handleUpdateVehicle : handleCreateVehicle
                }
              >
                <div className="form-group">
                  <label>Registration Number</label>

                  <input
                    type="text"
                    name="registrationNumber"
                    value={vehicleForm.registrationNumber}
                    onChange={handleVehicleChange}
                    placeholder="KA01AB1234"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Make</label>

                    <input
                      type="text"
                      name="make"
                      value={vehicleForm.make}
                      onChange={handleVehicleChange}
                      placeholder="Toyota"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Model</label>

                    <input
                      type="text"
                      name="model"
                      value={vehicleForm.model}
                      onChange={handleVehicleChange}
                      placeholder="Innova Crysta"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>

                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleChange}
                      min="1900"
                      max="2100"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Vehicle Type</label>

                    <select
                      name="vehicleType"
                      value={vehicleForm.vehicleType}
                      onChange={handleVehicleChange}
                      required
                    >
                      <option value="">Select type</option>

                      <option value="Car">Car</option>

                      <option value="SUV">SUV</option>

                      <option value="Van">Van</option>

                      <option value="Bus">Bus</option>

                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Price Per Day</label>

                  <input
                    type="number"
                    name="pricePerDay"
                    value={vehicleForm.pricePerDay}
                    onChange={handleVehicleChange}
                    min="0"
                    step="0.01"
                    placeholder="2500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={vehicleForm.isAvailable}
                      onChange={handleVehicleChange}
                    />{" "}
                    Available for rental
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button type="submit" className="primary-button">
                    {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetVehicleForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card-grid">
            {vehicles.length === 0 ? (
              <div className="empty-state">
                <h3>No vehicles found</h3>

                <p>Add your first rental vehicle.</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div className="card" key={vehicle.id}>
                  <h3>
                    {vehicle.make} {vehicle.model}
                  </h3>

                  <p>Registration: {vehicle.registrationNumber}</p>

                  <p>Type: {vehicle.vehicleType}</p>

                  <p>Year: {vehicle.year}</p>

                  <p>Price: ₹{vehicle.pricePerDay} / day</p>

                  <span
                    className={
                      vehicle.isAvailable
                        ? "status available"
                        : "status unavailable"
                    }
                  >
                    {vehicle.isAvailable ? "Available" : "Unavailable"}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      className="secondary-button"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      Edit
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      );
    }

    // -------------------------
    // BOOKINGS
    // -------------------------

    if (activePage === "bookings") {
      return (
        <section>
          <div className="page-header">
            <h1>Bookings</h1>

            <button
              className="primary-button"
              onClick={() => setActivePage("create-booking")}
            >
              + Create Booking
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <h3>No bookings yet</h3>

              <p>Create your first vehicle booking.</p>

              <button
                className="primary-button"
                onClick={() => setActivePage("create-booking")}
              >
                Create Booking
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {bookings.map((booking) => (
                <div className="card" key={booking.id}>
                  <h3>Booking #{booking.id}</h3>

                  <p>
                    Vehicle: {booking.vehicle?.make} {booking.vehicle?.model}
                  </p>

                  <p>
                    Pickup: {new Date(booking.pickupDate).toLocaleDateString()}
                  </p>

                  <p>
                    Return: {new Date(booking.returnDate).toLocaleDateString()}
                  </p>

                  <p>Total: ₹{booking.totalPrice}</p>

                  <span className="status available">{booking.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    // -------------------------
    // CREATE BOOKING
    // -------------------------

    if (activePage === "create-booking") {
      const availableVehicles = vehicles.filter(
        (vehicle) => vehicle.isAvailable,
      );

      return (
        <section>
          <div className="page-header">
            <h1>Create Booking</h1>

            <button
              className="secondary-button"
              onClick={() => setActivePage("bookings")}
            >
              ← Back to Bookings
            </button>
          </div>

          <div className="form-card">
            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Customer ID</label>

                <input
                  type="number"
                  name="customerId"
                  value={bookingForm.customerId}
                  onChange={handleBookingChange}
                  placeholder="Enter customer ID"
                />
              </div>

              <div className="form-group">
                <label>Vehicle</label>

                <select
                  name="vehicleId"
                  value={bookingForm.vehicleId}
                  onChange={handleBookingChange}
                >
                  <option value="">Select a vehicle</option>

                  {availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} -{" "}
                      {vehicle.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pickup Date</label>

                  <input
                    type="date"
                    name="pickupDate"
                    value={bookingForm.pickupDate}
                    onChange={handleBookingChange}
                  />
                </div>

                <div className="form-group">
                  <label>Return Date</label>

                  <input
                    type="date"
                    name="returnDate"
                    value={bookingForm.returnDate}
                    min={bookingForm.pickupDate || undefined}
                    onChange={handleBookingChange}
                  />
                </div>
              </div>

              {bookingMessage && (
                <div className="form-message">{bookingMessage}</div>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={bookingSaving}
              >
                {bookingSaving ? "Creating..." : "Create Booking"}
              </button>
            </form>
          </div>
        </section>
      );
    }

    // -------------------------
    // DASHBOARD
    // -------------------------

    return (
      <section>
        <h1>Dashboard</h1>

        <p className="welcome">Welcome to Transport Rental.</p>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Vehicles</span>

            <strong>{vehicles.length}</strong>
          </div>

          <div className="stat-card">
            <span>Available Vehicles</span>

            <strong>
              {vehicles.filter((vehicle) => vehicle.isAvailable).length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Total Bookings</span>

            <strong>{bookings.length}</strong>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🚗 Transport Rental</div>

        <nav>
          <button
            className={
              activePage === "dashboard" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={
              activePage === "vehicles" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActivePage("vehicles")}
          >
            Vehicles
          </button>

          <button
            className={
              activePage === "bookings" || activePage === "create-booking"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("bookings")}
          >
            Bookings
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Transport Rental</h2>
        </header>

        <div className="content">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
