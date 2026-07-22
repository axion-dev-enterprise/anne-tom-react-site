-- ===========================================================================
-- SCHEMA SUPABASE — ECOSISTEMA ANNE & TOM (PROJETO: lhpwxeblynsdkdldglmm)
-- Tabelas: clientes, pedidos, itens_pedido, pontos_fidelidade e webhooks
-- ===========================================================================

-- 1. TABELA DE CLIENTES (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    pin VARCHAR(6) DEFAULT '123456',
    points INT DEFAULT 0,
    address_cep VARCHAR(10),
    address_street TEXT,
    address_number VARCHAR(20),
    address_complement TEXT,
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100) DEFAULT 'São Paulo',
    address_uf VARCHAR(2) DEFAULT 'SP',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICE DE DESEMPENHO BUSCA TELEFONE
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- 2. TABELA DE PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_code VARCHAR(20) UNIQUE NOT NULL, -- Ex: AT-9842
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, preparing, out_for_delivery, done, cancelled
    payment_method VARCHAR(50) NOT NULL, -- pix, cartao, cartao_entrega, dinheiro
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total_final DECIMAL(10, 2) NOT NULL,
    delivery_type VARCHAR(20) DEFAULT 'delivery', -- delivery, pickup
    motoboy_name VARCHAR(100),
    motoboy_phone VARCHAR(20),
    pix_copia_colar TEXT,
    pix_qr_code_base64 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES DE STATUS E CLIENTE
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 3. TABELA DE ITENS DO PEDIDO (ORDER ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    half_description TEXT,
    extras JSONB DEFAULT '[]'::jsonb,
    border VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNÇÃO E TRIGGER AUTO-ATUALIZAÇÃO DE PONTOS DE FIDELIDADE
CREATE OR REPLACE FUNCTION public.process_order_loyalty()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando o pedido muda para ENTREGUE ('done') e o pagamento está APROVADO ('approved')
    IF (NEW.status = 'done' OR NEW.status = 'finalizado') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE public.customers
            SET points = points + FLOOR(NEW.total_final),
                updated_at = NOW()
            WHERE id = NEW.customer_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_loyalty_update ON public.orders;
CREATE TRIGGER trigger_loyalty_update
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.process_order_loyalty();

-- 5. ENABLE REALTIME NO SUPABASE (PUB/SUB)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
