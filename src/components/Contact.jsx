export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-blue flex justify-center items-center">
      <div className="max-w-lg w-full bg-navy bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-semibold mb-6 text-yellow text-center">Contact Us</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="border border-gray-300 bg-white text-white px-4 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-yellow"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="border border-gray-300 bg-white text-white px-4 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-yellow"
          />
          <textarea
            placeholder="Your Message"
            className="border border-gray-300 bg-white text-white px-4 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-yellow"
            rows="4"
          ></textarea>
          <button
            type="submit"
            className="bg-yellow text-navy px-6 py-2 rounded w-full font-semibold hover:bg-yellow-600 transition duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
