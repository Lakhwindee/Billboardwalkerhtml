import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import ContactForm from "@/components/contact-form";
import PhoneOTPVerification from "@/components/PhoneOTPVerification";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { type BottleSample } from "@shared/schema";


export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Get current user data for session-based authentication
  const { data: currentUserData } = useQuery({
    queryKey: ['/api/current-user'],
    retry: false,
  });

  // Fetch bottle samples from database
  const { data: bottleSamples = [] } = useQuery<BottleSample[]>({
    queryKey: ["/api/bottle-samples"],
  });

  // Filter active bottle samples by type
  const activeSamples = bottleSamples.filter(bottle => bottle.isActive);
  const largeBottles = activeSamples.filter(bottle => bottle.bottleType === '1L'); // 1L bottles (larger format)
  const standardBottles = activeSamples.filter(bottle => bottle.bottleType === '750ml'); // 750ml bottles (standard format)
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isJudgeUser, setIsJudgeUser] = useState(false);
  
  // Email verification state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationStep, setVerificationStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Complete Registration
  
  // Phone verification state
  const [showPhoneOTPModal, setShowPhoneOTPModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  // Forgot password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Complete Indian states and cities data
  const statesAndCities = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Ongole', 'Eluru', 'Srikakulam', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri', 'Mangalagiri', 'Chilakaluripet'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Bomdila', 'Ziro', 'Along', 'Changlang', 'Tezu', 'Khonsa', 'Seppa', 'Roing', 'Yingkiong', 'Anini', 'Hawai', 'Namsai', 'Daporijo', 'Koloriang', 'Basar', 'Mechuka'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Dhubri', 'North Lakhimpur', 'Golaghat', 'Sivasagar', 'Diphu', 'Mangaldoi', 'Haflong', 'Barpeta', 'Hojai', 'Lanka', 'Lumding', 'Mankachar', 'Margherita', 'Mariani', 'Marigaon', 'Nalbari'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri', 'Bhatapara', 'Dalli-Rajhara', 'Naila Janjgir', 'Tilda Newra', 'Mungeli', 'Pathalgaon', 'Baloda Bazar', 'Baikunthpur'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North West Delhi', 'South West Delhi', 'North East Delhi', 'Shahdara', 'South East Delhi'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Cuncolim', 'Quepem', 'Canacona', 'Pernem', 'Sanguem', 'Aldona', 'Arambol', 'Assagao', 'Benaulim', 'Calangute', 'Candolim', 'Colva'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Vapi', 'Anand', 'Porbandar', 'Godhra', 'Bhuj', 'Junagadh', 'Gandhidham', 'Veraval', 'Navsari', 'Mahesana', 'Botad', 'Palanpur', 'Deesa', 'Amreli', 'Kalol', 'Dahod', 'Modasa', 'Himmatnagar', 'Idar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Palwal', 'Rewari', 'Hansi', 'Narnaul', 'Fatehabad', 'Gohana', 'Tohana', 'Narwana', 'Mandi Dabwali', 'Charkhi Dadri', 'Shahabad', 'Pehowa', 'Samalkha', 'Pinjore'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Chamba', 'Una', 'Kangra', 'Hamirpur', 'Bilaspur', 'Nahan', 'Palampur', 'Sundernagar', 'Chail', 'Kasauli', 'Dalhousie', 'Keylong', 'Reckong Peo', 'Rohru', 'Jogindernagar', 'Rampur', 'Kinnaur', 'Lahaul', 'Spiti'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chatra', 'Gumla', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Palamu', 'Latehar', 'Garwa', 'Koderma', 'Jamtara', 'Simdega', 'Khunti', 'Seraikela', 'East Singhbhum', 'West Singhbhum'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Gadag-Betigeri', 'Udupi', 'Robertson Pet', 'Bhadravati', 'Chitradurga', 'Hassan', 'Mandya', 'Chikmagalur', 'Gangavati', 'Bagalkot', 'Ranebennuru', 'Karwar', 'Sirsi', 'Puttur', 'Nipani'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Calicut', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod', 'Kottayam', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Thalassery', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Parappanangadi', 'Kalamassery', 'Neyyattinkara', 'Kayamkulam', 'Nedumangad', 'Attingal', 'Adoor'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Narmadapuram', 'Itarsi', 'Sehore', 'Betul'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Ulhasnagar', 'Sangli-Miraj', 'Malegaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalgaon', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed', 'Gondia', 'Satara', 'Barshi', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Udgir', 'Hinganghat'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati', 'Tamenglong', 'Chandel', 'Jiribam', 'Kangpokpi', 'Tengnoupal', 'Kamjong', 'Noney', 'Pherzawl', 'Moreh'],
    'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Williamnagar', 'Nongpoh', 'Mairang', 'Resubelpara', 'Ampati', 'Mawkyrwat', 'Cherrapunji'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Serchhip', 'Champhai', 'Kolasib', 'Lawngtlai', 'Saitual', 'Khawzawl', 'Hnahthial', 'Mamit', 'Saiha'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Kiphire', 'Longleng', 'Peren', 'Mon'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Balangir', 'Jharsuguda', 'Jeypore', 'Barbil', 'Khordha', 'Sunabeda', 'Rayagada', 'Kendrapara', 'Titlagarh', 'Nabarangpur', 'Paradip', 'Bhawanipatna', 'Dhenkanal', 'Kendujhar', 'Jagatsinghpur', 'Koraput'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Zirakpur', 'Kot Kapura', 'Faridkot', 'Sunam', 'Jagraon', 'Dhuri', 'Nabha', 'Mansa', 'Kharar', 'Nangal', 'Malout', 'Rayya', 'Rampura Phul', 'Longowal', 'Urmar Tanda', 'Morinda', 'Budhlada', 'Ropar', 'Samrala'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Baran', 'Dhaulpur', 'Tonk', 'Beawar', 'Hanumangarh', 'Churu', 'Nagaur', 'Jhunjhunu', 'Dausa', 'Chittorgarh', 'Sawai Madhopur', 'Jaisalmer', 'Banswara', 'Pratapgarh', 'Dungarpur', 'Mount Abu', 'Fatehpur', 'Makrana', 'Sujangarh', 'Ladnu', 'Didwana', 'Ratangarh', 'Sardarshahar', 'Nokha', 'Nimbahera'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Jorethang', 'Nayabazar', 'Singtam', 'Rangpo'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukkudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumarakoil', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi', 'Ambur', 'Nagapattinam'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Miryalaguda', 'Suryapet', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Sangareddy', 'Metpally', 'Zaheerabad', 'MedaK', 'Siddipet', 'Vikarabad', 'Wanaparthy', 'Medchal', 'Jagityal'],
    'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Khowai', 'Bishramganj', 'Teliamura', 'Mohanpur', 'Melaghar', 'Sonamura', 'Kumarghat', 'Ranirbazar', 'Longtharai', 'Kamalasagar', 'Sabroom', 'Boxanagar', 'Panisagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Mau', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Ujhani', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida', 'Shikohabad', 'Shamli', 'Awagarh', 'Kasganj'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Kashipur', 'Rishikesh', 'Rudrapur', 'Almora', 'Mussoorie', 'Tehri', 'Pauri', 'Bageshwar', 'Pithoragarh', 'Champawat', 'Nainital', 'Udham Singh Nagar', 'Kotdwar', 'Ramnagar', 'Manglaur', 'Laksar', 'Sitarganj'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Bangaon', 'Cooch Behar'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Punch', 'Rajouri', 'Kupwara', 'Budgam', 'Ganderbal', 'Pulwama', 'Shopian', 'Kulgam', 'Bandipora', 'Doda', 'Kishtwar', 'Ramban', 'Reasi', 'Samba', 'Leh', 'Kargil'],
    'Ladakh': ['Leh', 'Kargil', 'Nubra', 'Changthang', 'Zanskar', 'Drass', 'Sankoo', 'Turtuk', 'Hunder', 'Diskit']
  };
  
  // Get cities for selected state
  const getCitiesForState = (state: string) => {
    return statesAndCities[state as keyof typeof statesAndCities] || [];
  };

  // Logo state
  const [activeLogo, setActiveLogo] = useState<string | null>(null);

  // Load website content from admin panel
  const [websiteContent, setWebsiteContent] = useState({
    trustedBadge: "TRUSTED BY THOUSANDS",
    heroTitle: {
      line1: "Custom Bottle",
      line2: "Advertising", 
      line3: "Revolution"
    },
    heroDescription: "Turn every water bottle into a walking billboard for your brand! Your advertisement travels everywhere - from offices to gyms, parks to cafes. Reach thousands of potential customers as your branded bottles become mobile marketing machines that work 24/7 in Chandigarh, Panchkula, and Mohali.",
    ctaButtonText: "Start Creating Now",
    stats: [
      { number: "50K+", label: "Bottles Delivered" },
      { number: "500+", label: "Happy Clients" },
      { number: "7", label: "Days Delivery" }
    ],
    bottleSection: {
      title: "See How Your Brand Looks on Bottles",
      subtitle: "Real bottle samples showing how your promotional design will appear"  
    },
    pageTitle: "IamBillBoard - Custom Bottle Advertising",
    metaDescription: "Transform ordinary water bottles into powerful marketing tools. Custom bottle advertising that reaches customers in Chandigarh, Panchkula, and Mohali."
  });

  // Check if user is signed in on page load (without automatic redirect)
  useEffect(() => {
    // Check session-based authentication first
    if (currentUserData) {
      setIsSignedIn(true);
      setCurrentUser(currentUserData.username);
      setIsJudgeUser(currentUserData.role === 'admin');
      return;
    }
    
    // Fallback to localStorage for older authentication
    const authStatus = localStorage.getItem('billboardwalker_auth');
    const savedUser = localStorage.getItem('billboardwalker_user');
    if (authStatus === 'true' && savedUser) {
      setIsSignedIn(true);
      setCurrentUser(savedUser);
      setIsJudgeUser(savedUser === 'judge');
      // No automatic redirect - user can stay on home page if they want
    }

    // Load active logo
    const loadActiveLogo = async () => {
      try {
        const response = await fetch('/api/logo-settings');
        const logos = await response.json();
        
        const activeLogo = logos.find((logo: any) => logo.isActive);
        if (activeLogo) {
          setActiveLogo(activeLogo.logoUrl);
        }
      } catch (error) {
        console.error('Error loading active logo:', error);
      }
    };

    loadActiveLogo();

    // Load website content from admin panel
    const savedContent = localStorage.getItem('billboardwalker_website_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setWebsiteContent(parsedContent);
        
        // Update page title and meta description
        document.title = parsedContent.pageTitle || "IamBillBoard - Custom Bottle Advertising";
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', parsedContent.metaDescription || "Transform ordinary water bottles into powerful marketing tools. Custom bottle advertising that reaches customers in Chandigarh, Panchkula, and Mohali.");
        }
      } catch (error) {
        console.log('Error loading website content, using defaults');
      }
    }

    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [currentUserData, showMobileMenu]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    

    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.message === 'Login successful') {
        setIsSignedIn(true);
        setCurrentUser(data.user.username);
        setIsJudgeUser(data.user.username === 'judge');
        localStorage.setItem('billboardwalker_auth', 'true');
        localStorage.setItem('billboardwalker_user', data.user.username);
        localStorage.setItem('billboardwalker_userId', data.user.id.toString());
        setShowSignInModal(false);
        setUsername('');
        setPassword('');
        // Show success message, but don't auto-redirect to dashboard
        alert('Successfully signed in! You can now access the Dashboard.');
      } else {
        alert(data.error || 'Invalid credentials! Please check your username and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message || 'Please check your credentials and try again'}`);
    }
  };

  // Send OTP for email verification
  const handleSendOTP = async () => {
    if (!email) {
      alert('Please enter your email address first!');
      return;
    }

    try {
      // Get Gmail configuration from localStorage
      const savedEmailConfig = localStorage.getItem('billboardwalker_email_config');
      let emailConfig = null;
      
      if (savedEmailConfig) {
        try {
          emailConfig = JSON.parse(savedEmailConfig);
        } catch (error) {
          console.log('Error parsing email config');
        }
      }
      
      if (!emailConfig?.gmailUser || !emailConfig?.gmailPassword) {
        alert('⚠️ Gmail email system not configured! Please contact administrator to setup email verification.');
        return;
      }

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, emailConfig }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setVerificationStep(2);
        setOtpTimer(600); // 10 minutes countdown
        setShowOTPModal(true);
        alert('OTP sent to your email! Please check your inbox.');
        
        // Start countdown timer
        const timer = setInterval(() => {
          setOtpTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(timer);
              setOtpSent(false);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        alert(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter the complete 6-digit OTP!');
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEmailVerified(true);
        setShowOTPModal(false);
        // Show phone OTP verification after email verification
        setShowPhoneOTPModal(true);
        alert('✅ Email verified successfully! Now please verify your phone number.');
      } else {
        alert(data.error || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('OTP verification failed. Please try again.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    if (!isEmailVerified) {
      alert('Please verify your email first!');
      return;
    }
    if (!isPhoneVerified) {
      alert('Please verify your phone number first!');
      return;
    }
    
    try {
      // Get saved email configuration
      const savedEmailConfig = localStorage.getItem('billboardwalker_email_config');
      const emailConfig = savedEmailConfig ? JSON.parse(savedEmailConfig) : null;
      
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          email,
          fullName,
          phone: mobile, // Fixed: using mobile for phone field
          address,
          city,
          state,
          pincode,
          company: businessName, // Fixed: using businessName for company field
          emailConfig // Pass email config for sending approval email
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Auto sign in after signup
        setIsSignedIn(true);
        setCurrentUser(username);
        setIsJudgeUser(username === 'judge');
        localStorage.setItem('billboardwalker_auth', 'true');
        localStorage.setItem('billboardwalker_user', username);
        localStorage.setItem('billboardwalker_userId', data.userId.toString());
        
        // Close modal and clear form
        setShowSignUpModal(false);
        setUsername('');
        setPassword('');
        setEmail('');
        setFullName('');
        setMobile('');
        setAddress('');
        setCity('');
        setState('');
        setPincode('');
        setBusinessName('');
        setConfirmPassword('');
        setIsEmailVerified(false);
        setIsPhoneVerified(false);
        setOtp('');
        setVerificationStep(1);
        
        alert('🎉 Account created successfully! Welcome to IamBillBoard! A confirmation email has been sent to your registered email address. You can now access the Dashboard.');
      } else {
        alert(data.error || 'Account creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Account creation failed. Please try again.');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setCurrentUser('');
    setIsJudgeUser(false);
    localStorage.removeItem('billboardwalker_auth');
    localStorage.removeItem('billboardwalker_user');
  };


  return (
    <div className="vibrant-bg min-h-screen text-gray-900">


      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-4">
              <img 
                src={activeLogo || "https://via.placeholder.com/80x80/ff6b6b/ffffff?text=IB"} 
                alt="IamBillBoard Logo" 
                className="w-20 h-20 object-contain filter drop-shadow-lg"
                onError={(e) => {
                  // Fallback to placeholder if custom logo fails to load
                  e.currentTarget.src = "https://via.placeholder.com/80x80/ff6b6b/ffffff?text=IB";
                }}
              />
              <div className="flex flex-col">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wider leading-tight transform scale-x-110" style={{fontFamily: 'Playfair Display, serif'}}>
                  IamBillboard
                </div>
                <div className="hidden md:block text-xs font-semibold text-gray-500 tracking-widest uppercase -mt-1">
                  Custom Bottle Advertising
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-black hover:text-red-500 transition-colors font-semibold">Home</a>
              <a href="/designs" className="text-gray-600 hover:text-black transition-colors font-semibold">Designs</a>
              <a href="/restrictions" className="text-gray-600 hover:text-black transition-colors font-semibold">Restrictions</a>
              <a href="#about" className="text-gray-600 hover:text-black transition-colors font-semibold">About</a>
              <a href="#contact" className="text-gray-600 hover:text-black transition-colors font-semibold">Contact</a>
              
              {isSignedIn && (
                <a href="/dashboard" className="text-gray-600 hover:text-black transition-colors font-semibold">Dashboard</a>
              )}
              {isJudgeUser && (
                <a href="/admin" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                  🛠️ Admin Panel
                </a>
              )}
              
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {currentUser}!</span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a
                    href="/signin"
                    className="text-gray-600 hover:text-black transition-colors font-semibold"
                    data-testid="nav-signin"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
                    data-testid="nav-signup"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="md:hidden relative mobile-menu-container">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:text-black focus:outline-none"
                data-testid="mobile-menu-button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              
              {/* Mobile Menu Dropdown */}
              {showMobileMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-48 z-50">
                  <a href="#home" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Home</a>
                  <a href="/designs" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Designs</a>
                  <a href="/restrictions" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Restrictions</a>
                  <a href="#about" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">About</a>
                  <a href="#contact" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Contact</a>
                  {isSignedIn && (
                    <a href="/dashboard" className="block px-4 py-2 text-gray-800 hover:text-red-500 font-semibold">Dashboard</a>
                  )}
                  {isJudgeUser && (
                    <a href="/admin" className="block px-4 py-2 text-purple-600 hover:text-purple-800 font-bold">🛠️ Admin Panel</a>
                  )}
                  
                  {isSignedIn ? (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Welcome, {currentUser}!</p>
                      <button
                        onClick={handleSignOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium w-full"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      <a
                        href="/signin"
                        className="block px-4 py-2 text-gray-600 hover:text-black font-semibold"
                        data-testid="mobile-signin"
                      >
                        Sign In
                      </a>
                      <a
                        href="/signup"
                        className="block px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full font-bold text-center"
                        data-testid="mobile-signup"
                      >
                        Sign Up
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ top: '20%', left: '10%', animationDelay: '0.5s' }}></div>
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ top: '40%', left: '80%', animationDelay: '1s' }}></div>
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ top: '60%', left: '20%', animationDelay: '1.5s' }}></div>
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ top: '80%', left: '70%', animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full border-2 border-blue-500/50 glass-effect shadow-2xl animate-bounce">
                  <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span className="text-xl font-black text-white tracking-wide drop-shadow-lg">{websiteContent.trustedBadge}</span>
                  <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>

                <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                  <span className="gradient-text">{websiteContent.heroTitle.line1}</span><br />
                  <span className="text-black">{websiteContent.heroTitle.line2}</span><br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-green-400 bg-clip-text text-transparent">{websiteContent.heroTitle.line3}</span>
                </h1>

                <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                  {websiteContent.heroDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <a
                  href={isSignedIn ? '/dashboard' : '/signin'}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-6 rounded-full text-lg font-bold shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  data-testid="hero-cta-button"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  {websiteContent.ctaButtonText}
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                {websiteContent.stats.map((stat, index) => {
                  const colorClasses = [
                    { bg: "bg-gradient-to-br from-red-500/10 to-pink-500/10", border: "border-red-500/20", text: "text-red-500" },
                    { bg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20", text: "text-blue-500" },
                    { bg: "bg-gradient-to-br from-green-500/10 to-emerald-500/10", border: "border-green-500/20", text: "text-green-500" }
                  ];
                  const colors = colorClasses[index % colorClasses.length];
                  
                  return (
                    <div key={index} className={`${colors.bg} p-6 rounded-2xl border ${colors.border} text-center shadow-lg`}>
                      <div className={`text-3xl font-black ${colors.text} mb-2`}>{stat.number}</div>
                      <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottle Showcase Section */}
            <div id="bottles" className="relative flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">{websiteContent.bottleSection.title}</h3>
                <p className="text-center text-gray-600 mb-8">{websiteContent.bottleSection.subtitle}</p>
                
                <div className="flex items-center justify-center">
                  {/* 1L Bottle - Left Side (Larger bottle) */}
                  <div className="text-center">
                    <div className="relative">
                      {largeBottles.length > 0 ? (
                        /* Show custom uploaded 1L bottle - MUCH LARGER SIZE */
                        <div className="w-52 h-[480px] rounded-lg mx-auto shadow-2xl border-4 border-emerald-300 relative overflow-hidden">
                          <img 
                            src={largeBottles[0].imageUrl} 
                            alt="1L Water Bottle"
                            className="w-full h-full object-cover rounded-lg"
                          />

                        </div>
                      ) : (
                        /* Show default promotional 1L bottle - MUCH LARGER SIZE */
                        <div className="w-48 h-[440px] bg-gradient-to-b from-emerald-200 via-emerald-100 to-emerald-50 rounded-full mx-auto shadow-2xl border-4 border-emerald-300 relative overflow-hidden">
                          {/* Bottle Cap - MUCH LARGER */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-14 bg-gradient-to-b from-emerald-600 to-emerald-500 rounded-full shadow-lg"></div>
                          
                          {/* Label Area for 1L bottle - MUCH LARGER SIZE */}
                          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-36 h-72 bg-white/95 rounded-sm flex flex-col items-center justify-center text-center shadow-lg border border-emerald-200">

                            <div className="text-base text-gray-600 mb-8">Large Label</div>
                            <div className="w-28 h-44 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-sm opacity-80 flex items-center justify-center">
                              <div className="text-sm text-white font-bold text-center">YOUR BRAND<br/>LOGO HERE</div>
                            </div>
                            <div className="text-sm text-gray-500 mt-6">Large Size</div>
                          </div>
                          
                          {/* Brand Badge */}
                          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-sm text-emerald-600 font-semibold">IamBillBoard</div>
                        </div>
                      )}
                      
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl scale-110 -z-10"></div>
                    </div>
                    

                  </div>


                </div>
                

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section id="about" className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">Proudly Partnered with Level Up Water</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are proud partners with Level Up Water, using their premium quality bottles for all our custom branding solutions. We bet their taste of water is more natural than any others.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="flex items-center mb-6 justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Official Partnership</h3>
                  <p className="text-blue-600 font-semibold">Level Up Water × IamBillBoard</p>
                </div>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span><strong>Premium Quality Bottles:</strong> Level Up Water's high-grade plastic bottles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span><strong>Food Grade Material:</strong> 100% safe and FDA approved materials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span><strong>Perfect Branding Surface:</strong> Smooth finish for crystal clear printing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span><strong>Eco-Friendly:</strong> Recyclable and environmentally responsible</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Partnership Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-sm text-gray-600">Level Up Water's proven quality with IamBillBoard's creative expertise</p>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Production</h3>
              <p className="text-sm text-gray-600">Established supply chain ensures quick delivery and consistent availability</p>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Best Value</h3>
              <p className="text-sm text-gray-600">Partnership benefits deliver both competitive pricing and premium quality</p>
            </div>
          </div>
        </div>
      </section>



      {/* How IamBillBoard Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">How IamBillBoard Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Branding</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Submit your logo, ad design, or any branding material you'd like printed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Quantity</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose how many bottles you want branded (minimum 1000 bottles).
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-yellow-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Design Approval</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our team reviews your submission for quality and compliance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-black text-purple-600">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Receive Your Bottles</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get your custom branded water bottles delivered in 7-10 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless Approval Process Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Seamless Approval Process</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our transparent workflow ensures your branded bottles meet quality standards while minimizing delays.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-500 relative">
              <div className="absolute -left-8 top-8 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-white">1</span>
              </div>
              <div className="ml-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Submission Received</h3>
                <p className="text-gray-600 leading-relaxed">
                  We'll send an email confirmation immediately with your order details and estimated timeline.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-yellow-500 relative">
              <div className="absolute -left-8 top-8 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-white">2</span>
              </div>
              <div className="ml-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Design Review</h3>
                <p className="text-gray-600 mb-4">Our design team examines your branding for:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Print quality and resolution</li>
                  <li>Branding guideline compliance</li>
                  <li>Content appropriateness</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-green-500 relative">
              <div className="absolute -left-8 top-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-white">3</span>
              </div>
              <div className="ml-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Approval Notification</h3>
                <p className="text-gray-600 leading-relaxed">
                  You'll receive an email with the approval status. If approved, we'll proceed with production. If changes are needed, we'll provide clear feedback.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-purple-500 relative">
              <div className="absolute -left-8 top-8 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-white">4</span>
              </div>
              <div className="ml-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Production & Shipping</h3>
                <p className="text-gray-600 leading-relaxed">
                  Once approved, your branded bottles will be produced and shipped within 7-10 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <div id="contact">
        <ContactForm />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-black text-xl">BW</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">IamBillBoard</h3>
              <p className="text-gray-400 text-sm">Premium bottle advertising solutions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-400 text-sm">Quick turnaround in 7 days in Chandigarh, Panchkula, Mohali</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Best Prices</h3>
              <p className="text-gray-400 text-sm">Competitive rates starting ₹70 per bottle</p>
            </div>
          </div>


        </div>
      </footer>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">Sign In to Dashboard</h2>
              <p className="text-gray-600">Access your Champagne Studio</p>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300"
                data-testid="button-signin"
              >
                Sign In
              </button>
              
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignInModal(false);
                    setShowForgotPasswordModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm underline"
                  data-testid="button-forgot-password"
                >
                  Forgot Password?
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">Don't have an account?</p>
                <button
                  onClick={() => {
                    setShowSignInModal(false);
                    setShowSignUpModal(true);
                  }}
                  className="text-red-500 hover:text-red-600 font-semibold"
                  data-testid="button-signup-redirect"
                >
                  Sign Up here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] shadow-2xl relative overflow-y-auto">
            <button
              onClick={() => setShowSignUpModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">Create Account</h2>
              <p className="text-gray-600">Join IamBillBoard and start creating!</p>
            </div>
            
            <form onSubmit={handleSignUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-700 mb-3">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isEmailVerified}
                      className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isEmailVerified ? 'bg-green-50 border-green-300' : 'bg-white'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!email || isEmailVerified}
                      className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                        isEmailVerified 
                          ? 'bg-green-500 text-white cursor-not-allowed' 
                          : email 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isEmailVerified ? '✓ Verified' : 'Verify Email'}
                    </button>
                  </div>
                  {isEmailVerified && (
                    <p className="text-xs text-green-600 mt-1">✓ Email verified successfully!</p>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-700 mb-3">Business Information</h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Name (Optional)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Your business or company name"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-700 mb-3">Address Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Complete Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="House/Shop No., Street, Area"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                      <select
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          setCity(''); // Reset city when state changes
                        }}
                        required
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndCities).map((stateName) => (
                          <option key={stateName} value={stateName}>{stateName}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        disabled={!state}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{!state ? 'Select State First' : 'Select City'}</option>
                        {state && getCitiesForState(state).map((cityName) => (
                          <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      pattern="[0-9]{6}"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="6-digit PIN code"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-red-700 mb-3">Account Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Choose a unique username"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Section - Spans both columns */}
              <div className="lg:col-span-2 space-y-4">
                <button
                  type="submit"
                  disabled={!isEmailVerified}
                  className={`w-full px-8 py-4 rounded-lg font-bold shadow-lg transition-all duration-300 text-lg ${
                    isEmailVerified 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isEmailVerified ? 'Create Account & Start Creating' : 'Verify Email First'}
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Already have an account?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignUpModal(false);
                      setShowSignInModal(true);
                    }}
                    className="text-red-500 hover:text-red-600 font-semibold"
                  >
                    Sign In here
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowOTPModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                📧
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Verify Your Email</h2>
              <p className="text-gray-600">Enter the 6-digit code sent to</p>
              <p className="text-blue-600 font-semibold">{email}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                />
              </div>
              
              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  otp.length === 6 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verify Email
              </button>
              
              {otpTimer > 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Resend OTP in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                </p>
              ) : (
                <button
                  onClick={handleSendOTP}
                  className="w-full py-2 text-blue-500 hover:text-blue-600 font-medium transition-all"
                >
                  Resend OTP
                </button>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  📧 Check your email inbox and spam folder. The OTP is valid for 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone OTP Verification Modal */}
      {showPhoneOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <PhoneOTPVerification
              phone={mobile}
              customerName={fullName}
              purpose="signup"
              onSuccess={() => {
                setIsPhoneVerified(true);
                setShowPhoneOTPModal(false);
                setVerificationStep(3);
                alert('✅ Phone verified successfully! Please complete your registration details to create your account.');
              }}
              onCancel={() => {
                setShowPhoneOTPModal(false);
                setIsPhoneVerified(false);
              }}
              title="Verify Your Phone Number"
              description={`We've sent a 6-digit code to ${mobile}`}
            />
          </div>
        </div>
      )}





      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Left Side - IamBillBoard */}
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-black">
                <span className="gradient-text">IamBillBoard</span>
              </h3>
              <p className="text-gray-400 mt-2">Custom Bottle Advertising Revolution</p>
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
Chandigarh • Mohali • Panchkula
              </div>
            </div>

            {/* Right Side - Partnership */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end mb-2">
                <span className="text-sm text-gray-400 mr-3">Proudly partnered with</span>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold text-blue-400">Level Up Water</h4>
              <p className="text-sm text-gray-400 mt-1">Premium Quality Water</p>
              <div className="text-xs text-gray-500 mt-2">
                Pure water • Natural taste • Trusted partner
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400">
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/restrictions" className="hover:text-white transition-colors">Restrictions</a>
              {isSignedIn && (
                <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              )}
              {isJudgeUser && (
                <a href="/admin" className="hover:text-white transition-colors">Admin Panel</a>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              © 2025 IamBillBoard. All rights reserved. | Trusted by businesses in Chandigarh, Panchkula, and Mohali.
            </p>
          </div>

        </div>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />

    </div>
  );
}