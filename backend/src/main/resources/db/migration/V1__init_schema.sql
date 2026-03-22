CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  position VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INT,
  vin VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, license_plate)
);

CREATE TABLE service_catalog (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE parts (
  id BIGSERIAL PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  category VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_number VARCHAR(30) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES users(id),
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
  service_catalog_id BIGINT REFERENCES service_catalog(id),
  service_type_label VARCHAR(255),
  requested_date DATE NOT NULL,
  time_slot VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE repair_orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  booking_id BIGINT REFERENCES bookings(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
  assigned_staff_id BIGINT REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'INTAKE',
  intake_notes TEXT,
  progress_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE repair_progress_events (
  id BIGSERIAL PRIMARY KEY,
  repair_order_id BIGINT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  step_label VARCHAR(100),
  created_by_user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE quotes (
  id BIGSERIAL PRIMARY KEY,
  quote_number VARCHAR(30) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  labor_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  parts_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(8, 4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  staff_notes TEXT,
  customer_response_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejected_reason TEXT
);

CREATE TABLE quote_lines (
  id BIGSERIAL PRIMARY KEY,
  quote_id BIGINT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_type VARCHAR(10) NOT NULL CHECK (line_type IN ('LABOR', 'PART')),
  service_catalog_id BIGINT REFERENCES service_catalog(id),
  part_id BIGINT REFERENCES parts(id),
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL
);

CREATE TABLE parts_requests (
  id BIGSERIAL PRIMARY KEY,
  request_number VARCHAR(30) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL REFERENCES repair_orders(id),
  requested_by_staff_id BIGINT NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMP
);

CREATE TABLE parts_request_lines (
  id BIGSERIAL PRIMARY KEY,
  parts_request_id BIGINT NOT NULL REFERENCES parts_requests(id) ON DELETE CASCADE,
  part_id BIGINT NOT NULL REFERENCES parts(id),
  quantity_requested INT NOT NULL,
  quantity_issued INT NOT NULL DEFAULT 0
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  payment_number VARCHAR(30) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL REFERENCES repair_orders(id),
  quote_id BIGINT REFERENCES quotes(id),
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  transaction_ref VARCHAR(255),
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE service_ratings (
  id BIGSERIAL PRIMARY KEY,
  repair_order_id BIGINT NOT NULL UNIQUE REFERENCES repair_orders(id),
  customer_id BIGINT NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE staff_schedules (
  id BIGSERIAL PRIMARY KEY,
  staff_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE (staff_id, day_of_week, start_time)
);

CREATE TABLE notification_settings (
  id BIGSERIAL PRIMARY KEY,
  event_key VARCHAR(64) NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  channel VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
  template_subject VARCHAR(255),
  template_body TEXT
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_repair_orders_customer ON repair_orders(customer_id);
CREATE INDEX idx_repair_orders_status ON repair_orders(status);
CREATE INDEX idx_quotes_repair ON quotes(repair_order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
