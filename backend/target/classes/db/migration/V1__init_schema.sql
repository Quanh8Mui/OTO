-- Schema for OTO Garage API

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE service_catalog (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(12,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE parts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity_on_hand INT NOT NULL,
  min_stock INT NOT NULL,
  category VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);


CREATE TABLE employees (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  position VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE staff_schedules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  staff_id BIGINT NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_staff_schedules_staff FOREIGN KEY (staff_id) REFERENCES users(id)
);

CREATE TABLE vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  license_plate VARCHAR(30) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  vin VARCHAR(100),
  color VARCHAR(100),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  service_catalog_id BIGINT,
  service_type_label VARCHAR(255),
  requested_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_bookings_service_catalog FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(id)
);

CREATE TABLE repair_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  booking_id BIGINT UNIQUE,
  customer_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  assigned_staff_id BIGINT,
  status VARCHAR(30) NOT NULL,
  intake_notes TEXT,
  progress_notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_repair_orders_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_repair_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_repair_orders_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  CONSTRAINT fk_repair_orders_staff FOREIGN KEY (assigned_staff_id) REFERENCES users(id)
);

CREATE TABLE repair_progress_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  repair_order_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  step_label VARCHAR(255) NOT NULL,
  created_by_user_id BIGINT,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_progress_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id),
  CONSTRAINT fk_progress_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE quotes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL,
  labor_total DECIMAL(12,2) NOT NULL,
  parts_total DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(8,4) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL,
  grand_total DECIMAL(12,2) NOT NULL,
  staff_notes TEXT,
  customer_response_note TEXT,
  created_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP NULL,
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  rejected_reason TEXT,
  CONSTRAINT fk_quotes_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id)
);

CREATE TABLE quote_lines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  quote_id BIGINT NOT NULL,
  line_type VARCHAR(20) NOT NULL,
  service_catalog_id BIGINT,
  part_id BIGINT,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_quote_lines_quote FOREIGN KEY (quote_id) REFERENCES quotes(id),
  CONSTRAINT fk_quote_lines_service FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(id),
  CONSTRAINT fk_quote_lines_part FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE parts_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL,
  requested_by_staff_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL,
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL,
  fulfilled_at TIMESTAMP NULL,
  CONSTRAINT fk_parts_requests_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id),
  CONSTRAINT fk_parts_requests_staff FOREIGN KEY (requested_by_staff_id) REFERENCES users(id)
);

CREATE TABLE parts_request_lines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parts_request_id BIGINT NOT NULL,
  part_id BIGINT NOT NULL,
  quantity_requested INT NOT NULL,
  quantity_issued INT NOT NULL,
  CONSTRAINT fk_parts_request_lines_request FOREIGN KEY (parts_request_id) REFERENCES parts_requests(id),
  CONSTRAINT fk_parts_request_lines_part FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_number VARCHAR(50) NOT NULL UNIQUE,
  repair_order_id BIGINT NOT NULL,
  quote_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  transaction_ref VARCHAR(100),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_payments_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id),
  CONSTRAINT fk_payments_quote FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

CREATE TABLE service_ratings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  repair_order_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_ratings_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id),
  CONSTRAINT fk_ratings_customer FOREIGN KEY (customer_id) REFERENCES users(id)
);

CREATE TABLE notification_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_key VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  channel VARCHAR(30) NOT NULL,
  template_subject VARCHAR(255) NOT NULL,
  template_body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);
