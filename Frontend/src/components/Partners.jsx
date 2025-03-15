import React from "react";

const Partners = () => {
  const partners = [
    { name: "Partner 1", logo: "/partner1.svg" },
    { name: "Hilton", logo: "/hilton.svg" },
    { name: "Ocean Blue", logo: "/ocean-blue.svg" },
    // ... 其他合作伙伴
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Meet Your Perfect Cause Partner
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Connect with everyday like-minded partners and goals to create
          meaningful and impactful collaborations.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center"
            >
              <img src={partner.logo} alt={partner.name} className="h-12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
