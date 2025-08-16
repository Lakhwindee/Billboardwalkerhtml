import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your message has been sent successfully. We'll contact you soon!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    createContactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            Ready to Start Your
            <span className="gradient-text"> Custom Campaign?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with us and let's create something amazing together. 
            Professional bottle advertising solutions in Chandigarh, Panchkula, and Mohali.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-black mb-6">Send us a Message</h3>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...form.register("name")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="Your full name"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...form.register("email")}
                  type="email"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="your.email@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...form.register("phone")}
                  type="tel"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="+91 99999 99999"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Brand (Optional)
                </label>
                <input
                  {...form.register("company")}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  placeholder="Your company or brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  {...form.register("message")}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Tell us about your custom bottle advertising needs..."
                />
                {form.formState.errors.message && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createContactMutation.isPending}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:cursor-not-allowed"
              >
                {createContactMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Message...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}