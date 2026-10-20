import MenuCard from '../MenuCard.jsx';

export default function MenuCategory({ menu }) {
  if (!menu?.categories?.length) return <p className="text-slate-500">No items available.</p>;
  return (
    <div className="space-y-8">
      {menu.categories.map((cat) => {
        const items = menu.items.filter((i) => String(i.category) === String(cat._id));
        if (!items.length) return null;
        return (
          <section key={cat._id}>
            <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold">{cat.name}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}