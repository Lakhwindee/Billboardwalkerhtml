import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import PhoneOTPVerification from "@/components/PhoneOTPVerification";

interface CheckoutData {
  quantity: number;
  bottleSize: string;
  description: string;
  useMixedSelection: boolean;
  mixedBottles: { '750ml': number; '1L': number };
  selectedOption: string;
  selectedCity: string;
  selectedArea: string;
  uploadedFile: File | null;
  totalAmount: number;
}

export default function Checkout() {
  const [location, navigate] = useLocation();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  
  // Customer information (email automatically taken from registered user)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    companyName: ''
  });

  // Indian states and cities data with comprehensive coverage
  const statesAndCities = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kadapa', 'Anantapur', 'Vizianagaram', 'Ongole', 'Eluru', 'Srikakulam', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri', 'Mangalagiri', 'Chilakaluripet'],
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
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Bangaon', 'Cooch Behar']
  };

  // Get cities for selected state
  const getCitiesForState = (state: string) => {
    return statesAndCities[state as keyof typeof statesAndCities] || [];
  };

  // Get all cities from all states
  const getAllCities = () => {
    const allCities: string[] = [];
    Object.values(statesAndCities).forEach(cities => {
      allCities.push(...cities);
    });
    return Array.from(new Set(allCities)).sort(); // Remove duplicates and sort
  };

  // Payment information
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet' | 'applepay'>('card');
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: ''
  });

  const [upiFormData, setUpiFormData] = useState({
    upiId: ''
  });

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Validation states
  const [customerValidationErrors, setCustomerValidationErrors] = useState<Record<string, boolean>>({});
  const [paymentValidationErrors, setPaymentValidationErrors] = useState<Record<string, boolean>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  // Phone OTP verification states
  const [showPhoneOTPModal, setShowPhoneOTPModal] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Load checkout data from localStorage when component mounts
  useEffect(() => {
    const savedCheckoutData = localStorage.getItem('billboardwalker_checkout_data');
    if (savedCheckoutData) {
      setCheckoutData(JSON.parse(savedCheckoutData));
    } else {
      // If no checkout data, redirect back to dashboard
      navigate('/');
    }
  }, [navigate]);

  // Customer info validation
  const validateCustomerInfo = () => {
    const errors: Record<string, boolean> = {};
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    
    requiredFields.forEach(field => {
      if (!customerInfo[field as keyof typeof customerInfo].trim()) {
        errors[field] = true;
      }
    });

    // Comprehensive validation with proper error messages
    if (customerInfo.fullName && !validateName(customerInfo.fullName)) {
      errors.fullName = true;
    }
    
    // Email validation removed - using registered user email automatically

    if (customerInfo.phone && !validatePhone(customerInfo.phone)) {
      errors.phone = true;
    }

    if (customerInfo.address && !validateAddress(customerInfo.address)) {
      errors.address = true;
    }

    if (customerInfo.pincode && !validatePincode(customerInfo.pincode)) {
      errors.pincode = true;
    }

    // State validation (must be from predefined list)
    if (customerInfo.state && !Object.keys(statesAndCities).includes(customerInfo.state)) {
      errors.state = true;
    }

    // City validation (must be from predefined list for the selected state)
    if (customerInfo.city && customerInfo.state) {
      const validCities = getCitiesForState(customerInfo.state);
      if (!validCities.includes(customerInfo.city)) {
        errors.city = true;
      }
    }

    setCustomerValidationErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  };

  // Validation functions
  // Email validation removed - using registered user email automatically

  const validatePhone = (phone: string): boolean => {
    // Indian phone number: 10 digits, can start with 6,7,8,9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s+-]/g, ''));
  };

  const validatePincode = (pincode: string): boolean => {
    // Indian pincode: 6 digits, first digit cannot be 0
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode) && pincode.length === 6;
  };

  const validateName = (name: string): boolean => {
    // Name should contain only letters and spaces, minimum 2 characters
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateAddress = (address: string): boolean => {
    // Address should be minimum 10 characters with letters, numbers, spaces, and common punctuation
    return address.trim().length >= 10 && /^[a-zA-Z0-9\s,.\-\/#]+$/.test(address);
  };

  const validateCardNumber = (cardNumber: string): boolean => {
    // Remove spaces and check if it's 16 digits
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleanNumber);
  };

  const validateExpiryDate = (expiryDate: string): boolean => {
    // Format MM/YY
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }
    
    return true;
  };

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateUPIId = (upiId: string): boolean => {
    // UPI ID format: username@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  };

  // Payment validation
  const validatePayment = () => {
    const errors: Record<string, boolean> = {};
    
    if (paymentMethod === 'card') {
      if (!paymentFormData.cardNumber.trim() || !validateCardNumber(paymentFormData.cardNumber)) {
        errors.cardNumber = true;
      }
      if (!paymentFormData.expiryDate.trim() || !validateExpiryDate(paymentFormData.expiryDate)) {
        errors.expiryDate = true;
      }
      if (!paymentFormData.cvv.trim() || !validateCVV(paymentFormData.cvv)) {
        errors.cvv = true;
      }
      if (!paymentFormData.cardholderName.trim() || !validateName(paymentFormData.cardholderName)) {
        errors.cardholderName = true;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiFormData.upiId.trim() || !validateUPIId(upiFormData.upiId)) {
        errors.upiId = true;
      }
    }
    // Note: netbanking, wallet, and applepay don't require additional validation
    // as they redirect to external payment gateways
    
    setPaymentValidationErrors(errors);
    setShowValidation(true);
    return Object.keys(errors).length === 0;
  };

  // Submit order with payment processing
  const submitOrder = async () => {
    setIsProcessingPayment(true);
    setPaymentError('');
    
    try {
      const orderDetails = {
        bottleType: checkoutData?.useMixedSelection ? 'Mixed' : checkoutData?.bottleSize || '750ml',
        quantity: checkoutData?.useMixedSelection ? 
          (checkoutData.mixedBottles['750ml'] + checkoutData.mixedBottles['1L']) : 
          checkoutData?.quantity || 1,
        description: checkoutData?.description || '',
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        pincode: customerInfo.pincode,
        designImageUrl: checkoutData?.uploadedFile ? checkoutData.uploadedFile.name : ''
      };

      let response;
      
      // Use unified payment initiation endpoint
      const paymentData = {
        amount: checkoutData?.totalAmount || 0,
        paymentMethod: paymentMethod,
        customerInfo: {
          ...customerInfo,
          upiId: paymentMethod === 'upi' ? upiFormData.upiId : undefined,
          cardData: paymentMethod === 'card' ? paymentFormData : undefined
        },
        orderDetails
      };
      
      response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.success) {
        // For UPI payment, need to verify
        if (paymentMethod === 'upi') {
          // Show verification progress for UPI
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verify payment using unified endpoint
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              transactionRef: result.transactionRef,
              paymentId: result.paymentData?.options?.order_id || `PAY${Date.now()}`,
              orderId: result.orderId,
              signature: null // For simulation mode
            })
          });
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success) {
            // Show processing animation for 1 more second
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Payment successful - save order success data
            localStorage.setItem('billboardwalker_order_success', JSON.stringify({
              campaignId: verifyResult.campaignId,
              transactionRef: result.transactionRef,
              customerName: customerInfo.fullName,
              email: 'user@example.com',
              phone: customerInfo.phone,
              bottleType: orderDetails.bottleType,
              quantity: orderDetails.quantity,
              totalAmount: checkoutData?.totalAmount || 0,
              paymentMethod: 'UPI Payment',
              submittedAt: new Date().toLocaleString()
            }));

            localStorage.removeItem('billboardwalker_checkout_data');
            navigate(`/order-success`);
          } else {
            // UPI verification failed - redirect to failure page
            localStorage.setItem('billboardwalker_payment_failure', JSON.stringify({
              reason: verifyResult.message || 'UPI payment verification failed',
              amount: checkoutData?.totalAmount || 0,
              paymentMethod: 'UPI Payment',
              transactionRef: result.transactionRef,
              customerName: customerInfo.fullName,
              timestamp: new Date().toLocaleString()
            }));
            navigate('/payment-failed');
            return;
          }
        } else {
          // Card payment - already processed on server
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          localStorage.setItem('billboardwalker_order_success', JSON.stringify({
            campaignId: result.campaignId,
            transactionRef: result.transactionRef,
            customerName: customerInfo.fullName,
            email: 'user@example.com',
            phone: customerInfo.phone,
            bottleType: orderDetails.bottleType,
            quantity: orderDetails.quantity,
            totalAmount: checkoutData?.totalAmount || 0,
            paymentMethod: 'Card Payment',
            submittedAt: new Date().toLocaleString()
          }));

          localStorage.removeItem('billboardwalker_checkout_data');
          navigate(`/order-success`);
        }
      } else {
        // Payment initiation failed - redirect to failure page
        localStorage.setItem('billboardwalker_payment_failure', JSON.stringify({
          reason: result.message || 'Payment could not be processed',
          amount: checkoutData?.totalAmount || 0,
          paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
          customerName: customerInfo.fullName,
          timestamp: new Date().toLocaleString()
        }));
        navigate('/payment-failed');
        return;
      }
    } catch (error: any) {

      // Network error - redirect to failure page
      localStorage.setItem('billboardwalker_payment_failure', JSON.stringify({
        reason: 'Network error occurred. Please check your connection.',
        amount: checkoutData?.totalAmount || 0,
        paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'UPI Payment',
        customerName: customerInfo.fullName,
        timestamp: new Date().toLocaleString()
      }));
      navigate('/payment-failed');
    }
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600 mb-4">Loading checkout...</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Secure Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your bottle advertising campaign order</p>
            </div>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center ${checkoutStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  checkoutStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  1
                </div>
                <span className="ml-3 text-sm font-medium">Customer Information</span>
              </div>
              <div className={`w-20 h-1 ${checkoutStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${checkoutStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  checkoutStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
                <span className="ml-3 text-sm font-medium">Payment Details</span>
              </div>
              <div className={`w-20 h-1 ${checkoutStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${checkoutStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  checkoutStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  3
                </div>
                <span className="ml-3 text-sm font-medium">Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Campaign Type:</span>
                  <span className="font-medium">Bottle Advertising</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bottles:</span>
                  <span className="font-medium">
                    {checkoutData.useMixedSelection ? 
                      `Mixed (${checkoutData.mixedBottles['750ml']} × 750ml + ${checkoutData.mixedBottles['1L']} × 1L)` :
                      `${checkoutData.quantity.toLocaleString()} × ${checkoutData.bottleSize}`
                    }
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distribution:</span>
                  <span className="font-medium">
                    {checkoutData.selectedOption === 'inStores' ? 'In Stores' :
                     checkoutData.selectedOption === 'atYourLocation' ? 'Direct Delivery' :
                     'Split Distribution'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{checkoutData.selectedArea}, {checkoutData.selectedCity}</span>
                </div>

                {checkoutData.description && (
                  <div className="space-y-2">
                    <span className="text-gray-600 text-sm font-medium">Campaign Description:</span>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm leading-relaxed">{checkoutData.description}</p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">₹{checkoutData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Design Preview Notice */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">📱 Design Preview Delivery</h4>
                <p className="text-xs text-green-700">
                  After approval, you'll receive your bottle design preview within <span className="font-medium">1-2 hours</span> via WhatsApp or email.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              
              {/* Step 1: Customer Information */}
              {checkoutStep === 1 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Customer Information</h3>
                  <p className="text-gray-600 mb-4">Please provide your details for order processing and delivery</p>
                  
                  {/* Admin Quick Fill Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setCustomerInfo({
                          fullName: 'Admin Test User',
                          phone: '9999999999',
                          address: 'Admin Test Address',
                          city: 'Mumbai',
                          state: 'Maharashtra',
                          pincode: '400001',
                          companyName: ''
                        });
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      type="button"
                    >
                      🚀 Admin Quick Fill (For Testing)
                    </button>
                  </div>

                  {/* Validation Error Summary */}
                  {showValidation && Object.keys(customerValidationErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <h4 className="text-sm font-bold text-red-800 mb-1">Please complete all required fields</h4>
                          <p className="text-sm text-red-600">Fields highlighted in red must be filled in</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={customerInfo.fullName}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                          setCustomerInfo({...customerInfo, fullName: value});
                        }}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showValidation && customerValidationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        data-testid="input-fullname"
                      />
                      {showValidation && customerValidationErrors.fullName && (
                        <p className="text-red-500 text-sm mt-1">Valid full name required (letters only)</p>
                      )}
                    </div>
                    

                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setCustomerInfo({...customerInfo, phone: value});
                        }}
                        placeholder="9876543210"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showValidation && customerValidationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        data-testid="input-phone"
                      />
                      {showValidation && customerValidationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">Valid Indian phone number required (10 digits, starting with 6/7/8/9)</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={customerInfo.companyName}
                        onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                        placeholder="Your company name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        data-testid="input-company"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="House number, street name, area, landmark"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        showValidation && customerValidationErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      rows={3}
                      data-testid="input-address"
                    />
                    {showValidation && customerValidationErrors.address && (
                      <p className="text-red-500 text-sm mt-1">Complete address required (minimum 10 characters)</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <select
                        value={customerInfo.state}
                        onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value, city: ''})}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showValidation && customerValidationErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        data-testid="select-state"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndCities).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {showValidation && customerValidationErrors.state && (
                        <p className="text-red-500 text-sm mt-1">State is required</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <select
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showValidation && customerValidationErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        disabled={!customerInfo.state}
                        data-testid="select-city"
                      >
                        <option value="">{customerInfo.state ? 'Select City' : 'First select state'}</option>
                        {customerInfo.state && getCitiesForState(customerInfo.state).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {showValidation && customerValidationErrors.city && (
                        <p className="text-red-500 text-sm mt-1">City is required</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                      <input
                        type="text"
                        value={customerInfo.pincode}
                        onChange={(e) => {
                          // Only allow numbers, max 6 digits
                          let value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length > 6) {
                            value = value.slice(0, 6);
                          }
                          // Prevent starting with 0
                          if (value.length > 0 && value.charAt(0) === '0') {
                            value = value.slice(1);
                          }
                          setCustomerInfo({...customerInfo, pincode: value});
                        }}
                        placeholder="160017"
                        maxLength={6}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          showValidation && customerValidationErrors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        data-testid="input-pincode"
                      />
                      {showValidation && customerValidationErrors.pincode && (
                        <p className="text-red-500 text-sm mt-1">Valid 6-digit PIN code required (cannot start with 0)</p>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <Link href="/" className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium">
                      ← Back to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        if (validateCustomerInfo()) {
                          if (!isPhoneVerified) {
                            // Show phone OTP verification modal
                            setShowPhoneOTPModal(true);
                          } else {
                            setCheckoutStep(2);
                            setShowValidation(false);
                          }
                        }
                      }}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                      data-testid="button-continue-payment"
                    >
                      {isPhoneVerified ? 'Continue to Payment →' : 'Verify Phone & Continue →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details */}
              {checkoutStep === 2 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Details</h3>
                  <p className="text-gray-600 mb-6">Choose your preferred payment method and enter details</p>

                  {/* Validation Error Summary */}
                  {showValidation && Object.keys(paymentValidationErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                          <h4 className="text-sm font-bold text-red-800 mb-1">Please complete payment details</h4>
                          <p className="text-sm text-red-600">All payment fields are required to proceed</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">Select Payment Method</h4>
                    
                    {/* Card Payment */}
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'card' ? 'border-blue-500' : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'card' && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">💳 Card Payment</p>
                          <p className="text-sm text-gray-600">Visa, MasterCard, RuPay</p>
                        </div>
                      </div>
                    </div>

                    {/* UPI Payment */}
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'upi' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                      }`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'upi' ? 'border-purple-500' : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'upi' && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">📱 UPI Payment</p>
                          <p className="text-sm text-gray-600">PhonePe, Google Pay, Paytm, BHIM</p>
                        </div>
                      </div>
                    </div>

                    {/* Net Banking */}
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'netbanking' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-green-300'
                      }`}
                      onClick={() => setPaymentMethod('netbanking')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'netbanking' ? 'border-green-500' : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'netbanking' && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">🏦 Net Banking</p>
                          <p className="text-sm text-gray-600">SBI, HDFC, ICICI, Axis & 50+ Banks</p>
                        </div>
                      </div>
                    </div>

                    {/* Digital Wallets */}
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'wallet' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-orange-300'
                      }`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'wallet' ? 'border-orange-500' : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'wallet' && (
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">👛 Digital Wallets</p>
                          <p className="text-sm text-gray-600">Paytm, Amazon Pay, Mobikwik, FreeCharge</p>
                        </div>
                      </div>
                    </div>

                    {/* Apple Pay */}
                    <div 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'applepay' 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('applepay')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'applepay' ? 'border-black' : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'applepay' && (
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">🍎 Apple Pay</p>
                          <p className="text-sm text-gray-600">Fast & Secure with Touch ID / Face ID</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                        <input
                          type="text"
                          value={paymentFormData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
                            setPaymentFormData({...paymentFormData, cardNumber: value});
                          }}
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            showValidation && paymentValidationErrors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          data-testid="input-card-number"
                        />
                        {showValidation && paymentValidationErrors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">Valid 16-digit card number required</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            value={paymentFormData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setPaymentFormData({...paymentFormData, expiryDate: value});
                            }}
                            placeholder="MM/YY"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              showValidation && paymentValidationErrors.expiryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            data-testid="input-expiry"
                          />
                          {showValidation && paymentValidationErrors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">Valid expiry date required (MM/YY)</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                          <input
                            type="text"
                            value={paymentFormData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                              setPaymentFormData({...paymentFormData, cvv: value});
                            }}
                            placeholder="123"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              showValidation && paymentValidationErrors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            data-testid="input-cvv"
                          />
                          {showValidation && paymentValidationErrors.cvv && (
                            <p className="text-red-500 text-sm mt-1">Valid 3-4 digit CVV required</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={paymentFormData.cardholderName}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                            setPaymentFormData({...paymentFormData, cardholderName: value});
                          }}
                          placeholder="Enter name on card"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            showValidation && paymentValidationErrors.cardholderName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          data-testid="input-cardholder"
                        />
                        {showValidation && paymentValidationErrors.cardholderName && (
                          <p className="text-red-500 text-sm mt-1">Valid cardholder name required</p>
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                        <input
                          type="text"
                          value={upiFormData.upiId}
                          onChange={(e) => setUpiFormData({...upiFormData, upiId: e.target.value})}
                          placeholder="yourname@paytm"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            showValidation && paymentValidationErrors.upiId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          data-testid="input-upi"
                        />
                        {showValidation && paymentValidationErrors.upiId && (
                          <p className="text-red-500 text-sm mt-1">Valid UPI ID required (e.g., name@paytm)</p>
                        )}
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <p className="text-sm text-purple-700">
                          Enter your UPI ID (e.g., 9876543210@paytm, name@okaxis, etc.)
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Bank *</label>
                        <select
                          className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300"
                          data-testid="select-bank"
                        >
                          <option value="">Choose your bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="boi">Bank of India</option>
                          <option value="canara">Canara Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="indusind">IndusInd Bank</option>
                          <option value="yes">Yes Bank</option>
                        </select>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p className="text-sm text-green-700">
                          You will be redirected to your bank's secure login page
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Wallet *</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="p-4 border border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 text-left transition-all">
                            <div className="text-2xl mb-1">📱</div>
                            <div className="font-medium">Paytm</div>
                            <div className="text-xs text-gray-600">Quick & Easy</div>
                          </button>
                          <button className="p-4 border border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 text-left transition-all">
                            <div className="text-2xl mb-1">🛒</div>
                            <div className="font-medium">Amazon Pay</div>
                            <div className="text-xs text-gray-600">Secure</div>
                          </button>
                          <button className="p-4 border border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 text-left transition-all">
                            <div className="text-2xl mb-1">💳</div>
                            <div className="font-medium">Mobikwik</div>
                            <div className="text-xs text-gray-600">Instant</div>
                          </button>
                          <button className="p-4 border border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 text-left transition-all">
                            <div className="text-2xl mb-1">🆓</div>
                            <div className="font-medium">FreeCharge</div>
                            <div className="text-xs text-gray-600">Fast</div>
                          </button>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-sm text-orange-700">
                          Choose your preferred wallet for instant payment
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'applepay' && (
                    <div className="space-y-4 mb-6">
                      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <div className="text-6xl mb-4">🍎</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Apple Pay</h3>
                        <p className="text-gray-600 mb-4">Fast, secure, and private way to pay</p>
                        <div className="bg-black text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2">
                          <span>🍎</span>
                          <span className="font-medium">Pay with Apple Pay</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <p className="text-sm text-gray-700">
                          Use Touch ID, Face ID, or your passcode to pay securely
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        setShowValidation(false);
                      }}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                      ← Back to Information
                    </button>
                    <button
                      onClick={() => {
                        if (validatePayment()) {
                          setCheckoutStep(3);
                          setShowValidation(false);
                        }
                      }}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                      data-testid="button-review-order"
                    >
                      Review Order →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Final Confirmation */}
              {checkoutStep === 3 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Order</h3>
                    <p className="text-gray-600">Please review all details before final submission</p>
                  </div>

                  {/* Customer Details Review */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">👤 Customer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-600">Name:</span> <span className="font-medium">{customerInfo.fullName}</span></div>
                      <div><span className="text-gray-600">Email:</span> <span className="font-medium">user@example.com</span></div>
                      <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{customerInfo.phone}</span></div>
                      {customerInfo.companyName && (
                        <div><span className="text-gray-600">Company:</span> <span className="font-medium">{customerInfo.companyName}</span></div>
                      )}
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Address:</span> 
                        <span className="font-medium"> {customerInfo.address}, {customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">💳 Payment Method</h4>
                    <div className="text-sm">
                      <div className="font-medium">
                        {paymentMethod === 'card' && '💳 Card Payment'}
                        {paymentMethod === 'upi' && '📱 UPI Payment'}
                        {paymentMethod === 'netbanking' && '🏦 Net Banking'}
                        {paymentMethod === 'wallet' && '👛 Digital Wallet'}
                        {paymentMethod === 'applepay' && '🍎 Apple Pay'}
                      </div>
                      <div className="text-gray-600 mt-1">
                        {paymentMethod === 'card' && 'Secure card processing'}
                        {paymentMethod === 'upi' && 'UPI instant payment'}
                        {paymentMethod === 'netbanking' && 'Bank account transfer'}
                        {paymentMethod === 'wallet' && 'Digital wallet payment'}
                        {paymentMethod === 'applepay' && 'Touch ID / Face ID payment'}
                      </div>
                    </div>
                  </div>

                  {/* Payment Error Display */}
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <div className="text-red-500 mr-2">⚠️</div>
                        <div className="text-red-700 font-medium">{paymentError}</div>
                      </div>
                    </div>
                  )}

                  {/* Final Actions */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setCheckoutStep(2);
                        setShowValidation(false);
                      }}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                      ← Back to Payment
                    </button>
                    <button
                      onClick={submitOrder}
                      disabled={isProcessingPayment}
                      className={`px-8 py-3 ${isProcessingPayment ? 'bg-blue-400' : 'bg-green-600 hover:bg-green-700'} text-white font-bold rounded-xl transition-colors shadow-lg ${!isProcessingPayment && 'transform hover:scale-105'} flex items-center justify-center min-w-[160px]`}
                      data-testid="button-submit-final-order"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        'Submit Order ✓'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Phone OTP Verification Modal */}
      {showPhoneOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <PhoneOTPVerification
              phone={customerInfo.phone}
              customerName={customerInfo.fullName}
              purpose="order_verification"
              onSuccess={() => {
                setIsPhoneVerified(true);
                setShowPhoneOTPModal(false);
                setCheckoutStep(2);
                setShowValidation(false);
              }}
              onCancel={() => {
                setShowPhoneOTPModal(false);
              }}
              title="Verify Your Phone Number"
              description={`Please verify your phone number ${customerInfo.phone} before proceeding to payment`}
            />
          </div>
        </div>
      )}
    </div>
  );
}