export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-600">
          💊 MediMinder
        </h1>

        <div className="space-x-4">
          <button className="text-gray-700">
            Login
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
            Registrieren
          </button>
        </div>
      </nav>


      <section className="flex flex-col items-center justify-center text-center px-6 py-24">

        <h2 className="text-5xl font-bold text-gray-800 max-w-3xl">
          Vergiss nie wieder deine Medikamente
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-xl">
          MediMinder erinnert dich zuverlässig an deine Einnahmen
          und hilft dir, deine Gesundheit besser zu organisieren.
        </p>


        <button className="mt-8 bg-green-600 text-white px-8 py-4 rounded-2xl text-lg shadow">
          Jetzt starten
        </button>


        <div className="grid md:grid-cols-3 gap-6 mt-16">

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold">
              ⏰ Erinnerungen
            </h3>
            <p className="mt-2 text-gray-600">
              Erhalte Benachrichtigungen zur richtigen Zeit.
            </p>
          </div>


          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold">
              💊 Medikamente
            </h3>
            <p className="mt-2 text-gray-600">
              Verwalte alle deine Medikamente einfach.
            </p>
          </div>


          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold">
              📊 Übersicht
            </h3>
            <p className="mt-2 text-gray-600">
              Sieh deinen Einnahmeverlauf jederzeit.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}