import React, { useState, useRef } from "react";

function MyMap() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pins, setPins] = useState([]);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState({
    x: 0,
    y: 0,
    label: "",
    description: "",
    deviceId: null,
  });
  const [editingPin, setEditingPin] = useState(null);
  const [draggingPin, setDraggingPin] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [placingDevice, setPlacingDevice] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    location: "all",
    showPinned: true,
    showAvailable: true,
  });

  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Enhanced device list with locations and more details
  const deviceList = [
    {
      id: 1,
      name: "Router A",
      type: "router",
      status: "online",
      ip: "192.168.1.1",
      location: "server_room",
      icon: "🌐",
      color: "bg-blue-500",
      manufacturer: "Cisco",
      model: "ISR4331",
      lastSeen: "2025-08-27T10:30:00Z",
    },
    {
      id: 2,
      name: "Switch B",
      type: "switch",
      status: "online",
      ip: "192.168.1.2",
      location: "server_room",
      icon: "🔗",
      color: "bg-green-500",
      manufacturer: "HP",
      model: "ProCurve 2824",
      lastSeen: "2025-08-27T10:25:00Z",
    },
    {
      id: 3,
      name: "Server Main",
      type: "server",
      status: "online",
      ip: "192.168.1.10",
      location: "server_room",
      icon: "🖥️",
      color: "bg-purple-500",
      manufacturer: "Dell",
      model: "PowerEdge R730",
      lastSeen: "2025-08-27T10:32:00Z",
    },
    {
      id: 4,
      name: "Firewall",
      type: "firewall",
      status: "online",
      ip: "192.168.1.254",
      location: "server_room",
      icon: "🛡️",
      color: "bg-red-500",
      manufacturer: "SonicWall",
      model: "TZ570",
      lastSeen: "2025-08-27T10:28:00Z",
    },
    {
      id: 5,
      name: "Printer Office",
      type: "printer",
      status: "offline",
      ip: "192.168.1.20",
      location: "office_floor1",
      icon: "🖨️",
      color: "bg-yellow-500",
      manufacturer: "HP",
      model: "LaserJet Pro",
      lastSeen: "2025-08-26T15:45:00Z",
    },
    {
      id: 6,
      name: "Access Point 1",
      type: "access_point",
      status: "online",
      ip: "192.168.1.30",
      location: "office_floor1",
      icon: "📡",
      color: "bg-indigo-500",
      manufacturer: "Ubiquiti",
      model: "UAP-AC-PRO",
      lastSeen: "2025-08-27T10:31:00Z",
    },
    {
      id: 7,
      name: "Camera Security",
      type: "camera",
      status: "online",
      ip: "192.168.1.40",
      location: "entrance",
      icon: "📹",
      color: "bg-pink-500",
      manufacturer: "Hikvision",
      model: "DS-2CD2142FWD",
      lastSeen: "2025-08-27T10:29:00Z",
    },
    {
      id: 8,
      name: "Storage NAS",
      type: "storage",
      status: "online",
      ip: "192.168.1.50",
      location: "server_room",
      icon: "💾",
      color: "bg-orange-500",
      manufacturer: "Synology",
      model: "DS920+",
      lastSeen: "2025-08-27T10:33:00Z",
    },
    {
      id: 9,
      name: "Switch Floor2",
      type: "switch",
      status: "online",
      ip: "192.168.1.3",
      location: "office_floor2",
      icon: "🔗",
      color: "bg-green-500",
      manufacturer: "Netgear",
      model: "GS724T",
      lastSeen: "2025-08-27T10:27:00Z",
    },
    {
      id: 10,
      name: "Camera Parking",
      type: "camera",
      status: "offline",
      ip: "192.168.1.41",
      location: "parking",
      icon: "📹",
      color: "bg-pink-500",
      manufacturer: "Axis",
      model: "M3027-PVE",
      lastSeen: "2025-08-25T18:20:00Z",
    },
  ];

  // Define device types and locations for filters
  const deviceTypes = [
    { value: "all", label: "All Types" },
    { value: "router", label: "Routers" },
    { value: "switch", label: "Switches" },
    { value: "server", label: "Servers" },
    { value: "firewall", label: "Firewalls" },
    { value: "printer", label: "Printers" },
    { value: "access_point", label: "Access Points" },
    { value: "camera", label: "Cameras" },
    { value: "storage", label: "Storage" },
  ];

  const deviceLocations = [
    { value: "all", label: "All Locations" },
    { value: "server_room", label: "Server Room" },
    { value: "office_floor1", label: "Office Floor 1" },
    { value: "office_floor2", label: "Office Floor 2" },
    { value: "entrance", label: "Entrance" },
    { value: "parking", label: "Parking" },
  ];

  const deviceStatuses = [
    { value: "all", label: "All Status" },
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
  ];

  // Apply filters to device list
  const applyFilters = (devices) => {
    return devices.filter((device) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchMatch =
          device.name.toLowerCase().includes(searchTerm) ||
          device.ip.includes(searchTerm) ||
          device.manufacturer?.toLowerCase().includes(searchTerm) ||
          device.model?.toLowerCase().includes(searchTerm);
        if (!searchMatch) return false;
      }

      // Type filter
      if (filters.type !== "all" && device.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && device.status !== filters.status) {
        return false;
      }

      // Location filter
      if (filters.location !== "all" && device.location !== filters.location) {
        return false;
      }

      return true;
    });
  };

  // Get devices that haven't been pinned yet
  const availableDevices = applyFilters(
    deviceList.filter(
      (device) => !pins.some((pin) => pin.deviceId === device.id)
    )
  );

  // Get pinned devices
  const pinnedDevices = pins.filter((pin) => pin.deviceId);

  // Filter pinned devices if needed
  const filteredPinnedDevices = filters.showPinned ? pinnedDevices : [];

  // Update filter
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      location: "all",
      showPinned: true,
      showAvailable: true,
    });
  };

  // Get filter counts
  const getFilterCounts = () => {
    const allDevices = deviceList;
    const totalDevices = allDevices.length;
    const onlineDevices = allDevices.filter(
      (d) => d.status === "online"
    ).length;
    const offlineDevices = allDevices.filter(
      (d) => d.status === "offline"
    ).length;
    const pinnedCount = pins.filter((p) => p.deviceId).length;
    const availableCount = totalDevices - pinnedCount;

    return {
      total: totalDevices,
      online: onlineDevices,
      offline: offlineDevices,
      pinned: pinnedCount,
      available: availableCount,
    };
  };

  const counts = getFilterCounts();

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPins([]); // Clear existing pins when new image is uploaded

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file (PNG, JPG, GIF, etc.)");
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop for file upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPins([]);
    setShowPinForm(false);
    setEditingPin(null);
    setDraggingPin(null);
    setSelectedDevice(null);
    setPlacingDevice(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle device selection for placing
  const selectDeviceForPlacement = (device) => {
    setSelectedDevice(device);
    setPlacingDevice(true);
  };

  // Cancel device placement
  const cancelDevicePlacement = () => {
    setSelectedDevice(null);
    setPlacingDevice(false);
  };

  // Handle image click to add pin or place device
  const handleImageClick = (e) => {
    if (!previewUrl || editingPin !== null || draggingPin !== null) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (placingDevice && selectedDevice) {
      // Place the selected device
      const pin = {
        id: Date.now(),
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        label: selectedDevice.name,
        description: `${selectedDevice.type} - ${selectedDevice.ip}`,
        deviceId: selectedDevice.id,
        color: selectedDevice.color,
        icon: selectedDevice.icon,
        status: selectedDevice.status,
      };

      setPins([...pins, pin]);
      setSelectedDevice(null);
      setPlacingDevice(false);
    } else {
      // Add custom pin
      setNewPin({ x, y, label: "", description: "", deviceId: null });
      setShowPinForm(true);
    }
  };

  // Pin dragging functionality
  const handlePinMouseDown = (e, pin) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = imageRef.current.getBoundingClientRect();
    const pinX = (pin.x / 100) * rect.width;
    const pinY = (pin.y / 100) * rect.height;

    setDraggingPin(pin.id);
    setDragOffset({
      x: e.clientX - rect.left - pinX,
      y: e.clientY - rect.top - pinY,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingPin || !imageRef.current) return;

    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100)
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100)
    );

    setPins(
      pins.map((pin) =>
        pin.id === draggingPin
          ? {
              ...pin,
              x: Math.round(x * 100) / 100,
              y: Math.round(y * 100) / 100,
            }
          : pin
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingPin(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add mouse event listeners for dragging
  React.useEffect(() => {
    if (draggingPin) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingPin, dragOffset, pins]);

  // Add new pin
  const addPin = () => {
    if (!newPin.label.trim()) {
      alert("Please enter a label for the pin");
      return;
    }

    const pin = {
      id: Date.now(),
      x: Math.round(newPin.x * 100) / 100,
      y: Math.round(newPin.y * 100) / 100,
      label: newPin.label.trim(),
      description: newPin.description.trim(),
      deviceId: null,
      color: getRandomPinColor(),
      icon: "📍",
    };

    setPins([...pins, pin]);
    setNewPin({ x: 0, y: 0, label: "", description: "", deviceId: null });
    setShowPinForm(false);
  };

  // Cancel adding pin
  const cancelAddPin = () => {
    setShowPinForm(false);
    setNewPin({ x: 0, y: 0, label: "", description: "", deviceId: null });
  };

  // Edit pin
  const startEditPin = (pin) => {
    if (draggingPin) return; // Don't edit if currently dragging
    setEditingPin({ ...pin });
  };

  // Save edited pin
  const saveEditPin = (updatedPin) => {
    // Validate coordinates
    const x = Math.max(0, Math.min(100, parseFloat(updatedPin.x) || 0));
    const y = Math.max(0, Math.min(100, parseFloat(updatedPin.y) || 0));

    const finalPin = {
      ...updatedPin,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      label: updatedPin.label.trim(),
    };

    setPins(pins.map((pin) => (pin.id === finalPin.id ? finalPin : pin)));
    setEditingPin(null);
  };

  // Cancel edit pin
  const cancelEditPin = () => {
    setEditingPin(null);
  };

  // Delete pin
  const deletePin = (pinId) => {
    setPins(pins.filter((pin) => pin.id !== pinId));
    setEditingPin(null);
  };

  // Get random pin color
  const getRandomPinColor = () => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Clear all pins
  const clearAllPins = () => {
    if (
      pins.length > 0 &&
      window.confirm("Are you sure you want to remove all pins?")
    ) {
      setPins([]);
      setShowPinForm(false);
      setEditingPin(null);
      setDraggingPin(null);
    }
  };

  // Remove device from map
  const removeDeviceFromMap = (deviceId) => {
    setPins(pins.filter((pin) => pin.deviceId !== deviceId));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        🗺️ Network Device Map with Interactive Pins
      </h1>

      {/* Upload Area */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Network Diagram / Floor Plan
        </h2>

        {/* Drag & Drop Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Icon */}
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isDragging
                ? "📥 Drop your network diagram here"
                : "🗺️ Click to upload or drag & drop network diagram"}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF - Network diagrams, floor plans, topology maps
            </p>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Choose Network Diagram
          </button>
        </div>

        {/* File Info */}
        {selectedImage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  ✅ Network Diagram Selected: {selectedImage.name}
                </p>
                <p className="text-xs text-green-600">
                  Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB |
                  Type: {selectedImage.type}
                </p>
              </div>
              <button
                onClick={clearImage}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Interactive Map Display - Left Side (3/4 width) */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🗺️ Interactive Network Map ({pins.length} devices)
              </h2>
              <div className="flex gap-2">
                {placingDevice && (
                  <button
                    onClick={cancelDevicePlacement}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    Cancel Placement
                  </button>
                )}
                {pins.length > 0 && (
                  <button
                    onClick={clearAllPins}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Clear All Pins
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Instructions */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡{" "}
                  <strong>
                    Select device from right panel then click map to place
                  </strong>{" "}
                  • <strong>Drag pins to move them</strong> •{" "}
                  <strong>Double-click pins to edit</strong>
                </p>
                {placingDevice && selectedDevice && (
                  <p className="text-sm text-orange-800 mt-2">
                    🎯 <strong>Placing: {selectedDevice.name}</strong> - Click
                    anywhere on the map to place this device
                  </p>
                )}
              </div>

              {/* Map Image Container */}
              <div className="flex justify-center">
                <div className="relative max-w-full border-2 border-gray-200 rounded-lg overflow-hidden select-none">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Interactive network map"
                    className={`max-w-full max-h-[600px] object-contain ${
                      draggingPin
                        ? "cursor-grabbing"
                        : placingDevice
                        ? "cursor-crosshair"
                        : "cursor-default"
                    }`}
                    onClick={handleImageClick}
                    draggable={false}
                  />

                  {/* Render Pins */}
                  {pins?.map((pin) => (
                    <div
                      key={pin.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-full group z-10 ${
                        draggingPin === pin.id
                          ? "cursor-grabbing z-20"
                          : "cursor-grab"
                      }`}
                      style={{
                        left: `${pin?.x}%`,
                        top: `${pin?.y}%`,
                      }}
                      onMouseDown={(e) => handlePinMouseDown(e, pin)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditPin(pin);
                      }}
                    >
                      {/* Pin Icon */}
                      <div
                        className={`w-10 h-10 ${
                          pin?.color
                        } rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-lg font-bold transition-transform ${
                          draggingPin === pin.id
                            ? "scale-110 shadow-xl"
                            : "hover:scale-110"
                        } ${pin.status === "offline" ? "opacity-60" : ""}`}
                      >
                        {draggingPin === pin.id ? "✋" : pin.icon || "📍"}
                      </div>

                      {/* Status indicator */}
                      {pin.deviceId && (
                        <div
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            pin.status === "online"
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                        ></div>
                      )}

                      {/* Pin Tooltip - only show when not dragging */}
                      {draggingPin !== pin.id && (
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 min-w-max">
                          <div className="font-semibold">{pin?.label}</div>
                          {pin?.description && (
                            <div className="text-gray-300">
                              {pin?.description}
                            </div>
                          )}
                          <div className="text-gray-400 text-[10px]">
                            Status: {pin.status || "unknown"} | x: {pin?.x}%, y:{" "}
                            {pin?.y}%
                          </div>
                        </div>
                      )}

                      {/* Drag indicator when dragging */}
                      {draggingPin === pin.id && (
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                          📌 Moving {pin.label}... x: {pin?.x}%, y: {pin?.y}%
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Device Placement Preview */}
                  {placingDevice && selectedDevice && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                        🎯 Click to place: {selectedDevice.name}
                      </div>
                    </div>
                  )}

                  {/* New Pin Preview */}
                  {showPinForm && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-full"
                      style={{
                        left: `${newPin?.x}%`,
                        top: `${newPin?.y}%`,
                      }}
                    >
                      <div className="w-10 h-10 bg-gray-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-lg animate-pulse">
                        📍
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Device List Panel with Filters - Right Side (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  🖥️ Device List
                </h3>
                <div className="text-xs text-gray-500">
                  {counts.total} total
                </div>
              </div>

              {/* Filter Section */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    🔍 Filters
                  </h4>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div>
                  <input
                    type="text"
                    placeholder="Search devices, IP, model..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 gap-2">
                  {/* Device Type */}
                  <select
                    value={filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {deviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {/* Device Status */}
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter("status", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {deviceStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  {/* Device Location */}
                  <select
                    value={filters.location}
                    onChange={(e) => updateFilter("location", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {deviceLocations.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold text-green-600">
                      {counts.online}
                    </div>
                    <div className="text-gray-600">Online</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold text-red-600">
                      {counts.offline}
                    </div>
                    <div className="text-gray-600">Offline</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold text-blue-600">
                      {counts.pinned}
                    </div>
                    <div className="text-gray-600">Pinned</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold text-purple-600">
                      {counts.available}
                    </div>
                    <div className="text-gray-600">Available</div>
                  </div>
                </div>
              </div>

              {/* Available Devices */}
              {filters.showAvailable && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    📋 Available Devices ({availableDevices.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedDevice?.id === device.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => selectDeviceForPlacement(device)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{device.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {device.name}
                            </p>
                            <p className="text-xs text-gray-500">{device.ip}</p>
                            <p className="text-xs text-gray-400">
                              {deviceLocations.find(
                                (l) => l.value === device.location
                              )?.label || device.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              {device.manufacturer} {device.model}
                            </p>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              device.status === "online"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {availableDevices.length === 0 && (
                      <p className="text-gray-500 text-sm italic text-center py-4">
                        {filters.search ||
                        filters.type !== "all" ||
                        filters.status !== "all" ||
                        filters.location !== "all"
                          ? "No devices match the current filters"
                          : "All devices have been placed on the map"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Pinned Devices */}
              {filters.showPinned && filteredPinnedDevices.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    📍 Pinned Devices ({filteredPinnedDevices.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filteredPinnedDevices.map((pin) => {
                      const device = deviceList.find(
                        (d) => d.id === pin.deviceId
                      );
                      return (
                        <div
                          key={pin.id}
                          className="p-2 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pin.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-xs truncate">
                                {pin.label}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                x: {pin.x}%, y: {pin.y}%
                              </p>
                              {device && (
                                <p className="text-[10px] text-gray-400">
                                  {deviceLocations.find(
                                    (l) => l.value === device.location
                                  )?.label || device.location}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeDeviceFromMap(pin.deviceId)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                              title="Remove from map"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Pin Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!placingDevice) {
                      setNewPin({
                        x: 50,
                        y: 50,
                        label: "",
                        description: "",
                        deviceId: null,
                      });
                      setShowPinForm(true);
                    }
                  }}
                  disabled={placingDevice}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  📍 Add Custom Pin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pin Form Modal */}
      {showPinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📍 Add Custom Pin
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newPin.x}
                    onChange={(e) =>
                      setNewPin({
                        ...newPin,
                        x: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newPin.y}
                    onChange={(e) =>
                      setNewPin({
                        ...newPin,
                        y: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pin Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPin.label}
                  onChange={(e) =>
                    setNewPin({ ...newPin, label: e.target.value })
                  }
                  placeholder="e.g., Main Entrance, Note, Important Location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newPin.description}
                  onChange={(e) =>
                    setNewPin({ ...newPin, description: e.target.value })
                  }
                  placeholder="Additional details about this location..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addPin}
                  disabled={!newPin.label.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ✅ Add Pin
                </button>
                <button
                  onClick={cancelAddPin}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pin Modal */}
      {editingPin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✏️ Edit {editingPin.deviceId ? "Device" : "Pin"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editingPin.x}
                    onChange={(e) =>
                      setEditingPin({
                        ...editingPin,
                        x: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editingPin.y}
                    onChange={(e) =>
                      setEditingPin({
                        ...editingPin,
                        y: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingPin.label}
                  onChange={(e) =>
                    setEditingPin({
                      ...editingPin,
                      label: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editingPin.deviceId} // Disable for device pins
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingPin.description}
                  onChange={(e) =>
                    setEditingPin({
                      ...editingPin,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => saveEditPin(editingPin)}
                  disabled={!editingPin.label.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => deletePin(editingPin.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  🗑️
                </button>
                <button
                  onClick={cancelEditPin}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 How to Use Network Device Map with Filters
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Use filters</strong> to search and filter devices by type,
              status, location, or keywords
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Click devices in the right panel</strong> to select them
              for placement on the map
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Search function</strong> works with device names, IP
              addresses, manufacturers, and models
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Filter statistics</strong> show counts for online/offline
              devices and pinned/available devices
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Drag pins</strong> to move devices around the network
              diagram
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Double-click pins</strong> to edit device position or add
              notes
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MyMap;
