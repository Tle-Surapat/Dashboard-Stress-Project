export default function AboutUs() {
  return (
    <section id="about-us" className="py-16 bg-blue_green">
      <div className="max-w-screen-lg mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-yellow">About Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1 */}
          <div className="bg-navy bg-opacity-30 p-6 rounded-lg">
            <h4 className="text-2xl font-semibold mb-4 text-yellow">Welcome to the future of stress management!</h4>
            <p className="text-white leading-relaxed">
              We are a passionate team of researchers, engineers, and innovators dedicated to revolutionizing the way stress is understood and managed. Our mission is to leverage cutting-edge technology to enhance mental well-being and improve lives.
            </p>
            <p className="text-white mt-4 leading-relaxed">
              At the heart of our work is an AI-driven Stress Detection System that uses physiological signals such as heart rate, skin conductance, and temperature to provide accurate and real-time stress analysis. By combining advancements in machine learning, signal processing, and wearable technology, we aim to create a seamless and reliable tool that empowers individuals to take control of their mental health.
            </p>
          </div>

          {/* Column 2 */}
          <div className="bg-navy bg-opacity-30 p-6 rounded-lg">
            <h4 className="text-2xl font-semibold mb-4 text-yellow">Our Vision</h4>
            <p className="text-white leading-relaxed mb-6">
              To build a world where mental well-being is accessible, personalized, and proactive—powered by technology that truly understands you.
            </p>

            <h4 className="text-2xl font-semibold mb-4 text-yellow">Our Technology</h4>
            <ul className="text-white list-disc list-inside space-y-2">
              <li>Physiological Signal Monitoring: Our system collects data from wearable devices, analyzing patterns related to stress indicators.</li>
              <li>Artificial Intelligence: Advanced AI algorithms detect stress levels with high precision, adapting to each individual's unique physiological responses.</li>
              <li>Real-Time Insights: Users receive actionable feedback and stress management suggestions to help them stay balanced and focused.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 bg-navy bg-opacity-30 p-6 rounded-lg">
          <h4 className="text-2xl font-semibold mb-4 text-yellow">Why Choose Us?</h4>
          <ul className="text-white list-disc list-inside space-y-2">
            <li>Science-Backed: Grounded in years of research in physiology and AI.</li>
            <li>Personalized Approach: Tailored recommendations for every user.</li>
            <li>Proactive Care: Designed to detect stress before it impacts daily life.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
