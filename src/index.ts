import express from "express";
import cors from "cors";
import fs from 'node:fs/promises';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  category: string;
  brand: string;
  discount: number;
}

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));  

app.use(express.json());

app.use(express.urlencoded({extended: true}));


app.get('/api/products/', async (req, res) => {
  const fileData = await fs.readFile('./src/data.json', 'utf-8');
  const products = JSON.parse(fileData);
  return res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const fileData = await fs.readFile('./src/data.json', 'utf-8');
  const products = JSON.parse(fileData);

  const product = products.find((p: Product) => p.id === Number(id));
  if (!product) {
    return res.status(404).json({error: 'Product not found'});
  }

  return res.json(product);
});

app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const productId = product?.id;

    if (!productId) {
      return res.status(400).json({ error: 'Provide ProductId' });
    }

    const fileData = await fs.readFile('./src/data.json', 'utf-8');
    const products = JSON.parse(fileData);

    if (products.some((p: Product) => p.id === productId)) {
      return res.status(400).json({ error: 'Product with this ID already exists' });
    }

    products.push(product);

    await fs.writeFile('./src/data.json', JSON.stringify(products, null, 2), 'utf-8');

    return res.status(201).json(product);

  } catch (error) {
    console.error('Error saving product:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  const fileData = await fs.readFile('./src/data.json', 'utf-8');
  const products = JSON.parse(fileData);

  const index = products.findIndex((p: Product) => p.id == Number(id));

  if (index === -1) {
    return res.status(404).json({error: 'Product not found'});
  }

  products[index] = {
    ...products[index],
    ...updates,
    id: products[index].id
  };

  await fs.writeFile('./src/data.json', JSON.stringify(products, null, 2), 'utf-8');

  return res.json(products[index]);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;

  const fileData = await fs.readFile('./src/data.json', 'utf-8');
  const products = JSON.parse(fileData);

  const index = products.findIndex((p: Product) => p.id == Number(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = products.splice(index, 1)[0];

  await fs.writeFile('./src/data.json', JSON.stringify(products, null, 2), 'utf-8');

  return res.json({ message: 'Product successfully deleted', deletedProduct });
});

app.listen(3000, () => console.log(`Server started on port 3000`));