CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  departement VARCHAR(50),
  salaire DECIMAL(10,2),
  date_embauche DATE,
  actif BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS produits (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50),
  libelle VARCHAR(200),
  categorie VARCHAR(50),
  prix DECIMAL(10,2),
  stock INTEGER,
  fournisseur VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  ref_transaction VARCHAR(50),
  montant DECIMAL(12,2),
  devise VARCHAR(10),
  statut VARCHAR(20),
  date_transaction TIMESTAMP DEFAULT NOW(),
  client_id INTEGER
);

INSERT INTO clients (nom, email) VALUES
('Alice Dupont', 'alice@example.com'),
('Bob Martin', 'bob@example.com'),
('Yasmine Aboud', 'yasmine@vermeg.com');

INSERT INTO employes (nom, prenom, departement, salaire, date_embauche, actif) VALUES
('Ben Ali', 'Mohamed', 'Informatique', 4500.00, '2020-03-15', true),
('Trabelsi', 'Sana', 'Finance', 5200.00, '2019-07-01', true),
('Gharbi', 'Yassine', 'Marketing', 3800.00, '2021-01-10', true),
('Mansouri', 'Rim', 'Informatique', 4900.00, '2018-11-20', true),
('Boughanmi', 'Khaled', 'RH', 3500.00, '2022-05-05', true),
('Jebali', 'Amira', 'Finance', 5800.00, '2017-09-12', true),
('Hamdi', 'Omar', 'Informatique', 4200.00, '2023-02-28', true),
('Slama', 'Nadia', 'Marketing', 3600.00, '2021-08-15', true),
('Ayari', 'Bilel', 'RH', 3200.00, '2022-11-01', true),
('Khelifi', 'Yasmine', 'Finance', 6100.00, '2016-04-20', true);

INSERT INTO produits (reference, libelle, categorie, prix, stock, fournisseur) VALUES
('PRD-001', 'Laptop Dell Inspiron 15', 'Informatique', 1299.99, 45, 'Dell Tunisia'),
('PRD-002', 'Ecran Samsung 27', 'Informatique', 399.99, 120, 'Samsung MENA'),
('PRD-003', 'Chaise ergonomique', 'Mobilier', 599.00, 30, 'Office Pro'),
('PRD-004', 'Imprimante HP LaserJet', 'Informatique', 299.00, 60, 'HP Maghreb'),
('PRD-005', 'Bureau reglable', 'Mobilier', 850.00, 15, 'Office Pro');

INSERT INTO transactions (ref_transaction, montant, devise, statut, client_id) VALUES
('TRX-2025-001', 15000.00, 'TND', 'VALIDEE', 1),
('TRX-2025-002', 8500.50, 'TND', 'EN_ATTENTE', 2),
('TRX-2025-003', 3200.00, 'EUR', 'VALIDEE', 3),
('TRX-2025-004', 25000.00, 'TND', 'REJETEE', 1),
('TRX-2025-005', 9800.00, 'TND', 'VALIDEE', 2);
