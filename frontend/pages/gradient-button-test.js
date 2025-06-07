import Layout from '../components/Layout';
import { GradientButton } from '../components/ui/gradient-button';

export default function GradientButtonTest() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gradient Button Component Test
            </h1>
            <p className="text-xl text-gray-600">
              Testing the new gradient button component with different variants
            </p>
          </div>

          <div className="space-y-12">
            {/* Default Variant */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Default Variant</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <GradientButton>Get Started</GradientButton>
                <GradientButton>Learn More</GradientButton>
                <GradientButton>Contact Us</GradientButton>
              </div>
            </div>

            {/* Variant Style */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Variant Style</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <GradientButton variant="variant">Get Started</GradientButton>
                <GradientButton variant="variant">Learn More</GradientButton>
                <GradientButton variant="variant">Contact Us</GradientButton>
              </div>
            </div>

            {/* Different Sizes */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Mixed Usage</h2>
              <div className="flex flex-wrap justify-center gap-6 items-center">
                <GradientButton className="px-6 py-2 text-sm">Small</GradientButton>
                <GradientButton>Regular</GradientButton>
                <GradientButton className="px-12 py-5 text-lg">Large</GradientButton>
              </div>
            </div>

            {/* With Icons */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">With Icons</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <GradientButton>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Get Started
                  </span>
                </GradientButton>
                <GradientButton variant="variant">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New
                  </span>
                </GradientButton>
              </div>
            </div>

            {/* Disabled State */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Disabled State</h2>
              <div className="flex flex-wrap justify-center gap-6">
                <GradientButton disabled>Disabled Default</GradientButton>
                <GradientButton variant="variant" disabled>Disabled Variant</GradientButton>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600">
              Hover over the buttons to see the gradient animation effects!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
