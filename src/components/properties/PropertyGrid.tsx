"use client";

import PropertyCard, { type Property } from "./PropertyCard";

const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Dream House",
    type: "House",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    status: "rent",
    isMostDemanded: true,
  },
  {
    id: "2",
    title: "Dream House",
    type: "Residential Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    status: "rent",
    isMostDemanded: true,
  },
  {
    id: "3",
    title: "Dream House",
    type: "Villa",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    status: "free",
    isMostDemanded: true,
  },
  {
    id: "4",
    title: "Dream House",
    type: "Commercial Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    status: "free",
    isMostDemanded: true,
  },
  {
    id: "5",
    title: "Dream House",
    type: "House",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
    status: "rent",
  },
  {
    id: "6",
    title: "Dream House",
    type: "Villa",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=400&h=300&fit=crop",
    status: "free",
  },
  {
    id: "7",
    title: "Dream House",
    type: "Commercial Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=400&h=300&fit=crop",
    status: "free",
  },
  {
    id: "8",
    title: "Dream House",
    type: "Residential Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    status: "rent",
  },
  {
    id: "9",
    title: "Dream House",
    type: "House",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop",
    status: "rent",
    isMostDemanded: true,
  },
  {
    id: "10",
    title: "Dream House",
    type: "Villa",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
    status: "free",
    isMostDemanded: true,
  },
  {
    id: "11",
    title: "Dream House",
    type: "Residential Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    status: "rent",
    isMostDemanded: true,
  },
  {
    id: "12",
    title: "Dream House",
    type: "Commercial Flat",
    address: "Evergreen 15 Jakarta, Thailand",
    price: 388.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
    status: "free",
    isMostDemanded: true,
  },
];

export default function PropertyGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {MOCK_PROPERTIES.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
