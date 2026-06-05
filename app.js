/* EventCraft - Interactive Pricing & Planner Logic */

document.addEventListener('DOMContentLoaded', function() {
    
    /* --------------------------------------------------
       1. Catalog Pricing Data Structure
    -------------------------------------------------- */
    const PRICES = {
        // Invitations
        inv_dig_1page: 899,
        inv_dig_multipage: 1499,
        inv_premium_suite: 2499,
        inv_video: 2499,
        inv_print: 250, // Per page
        
        // Welcome Boards & Signage
        board_design_only: 999,
        board_design_print: 1499,
        board_design_print_board: 1999,
        board_custom_signage: 1299,
        
        // Standee & Display Options (Rentals per hour)
        rental_board: 200,
        rental_easel: 200,
        rental_combo: 350,
        rental_setup: 999, // Flat setup
        
        // Digital Event Branding
        dig_custom_event: 799,
        dig_wa_creative: 599,
        dig_wa_pkg: 1499,
        dig_ig_story: 599,
        dig_ig_post: 699,
        dig_countdown: 699,
        dig_highlight: 699,
        dig_thank_you: 599,
        dig_announcement: 699,
        dig_save_date: 799,
        dig_reminder: 599,
        dig_pkg_5: 2499,
        dig_pkg_10: 4499,
        
        // Return Gift Branding (Standalone Design)
        brand_tag_design: 499,
        brand_tag_print: 799,
        brand_sticker_design: 499,
        brand_sticker_print: 799,
        brand_bag_sticker_design: 599,
        brand_bag_sticker_print: 999,
        
        // Customized Accessories
        acc_choco_design: 699,
        acc_choco_print: 1099,
        acc_bottle_design: 699,
        acc_bottle_print: 1099,
        acc_cupcake_design: 699,
        acc_cupcake_print: 1099,
        acc_box_sticker_design: 499,
        acc_box_sticker_print: 799,
        acc_envelope_design: 499,
        acc_envelope_print: 799,
        
        // Event Stationery
        stat_thanks_design: 699,
        stat_thanks_print: 999,
        stat_menu_design: 799,
        stat_menu_print: 1199,
        stat_table_design: 699,
        stat_table_print: 999,
        stat_place_design: 699,
        stat_place_print: 999,
        stat_note_design: 699,
        stat_note_print: 999,
        stat_schedule_design: 799,
        stat_schedule_print: 1199,
        stat_seating_design: 1299,
        stat_seating_print: 1999,
        
        // Event Branding & Decor Artwork
        dec_photobooth_design: 1299,
        dec_photobooth_print: 1999,
        dec_backdrop: 1499,
        dec_stage: 1999,
        dec_theme: 3999
    };

    // Return Gift Bag Matrix (per unit cost)
    const BAG_PRICES = {
        plastic: {
            plain: 45,
            sticker: 60,
            tag: 65,
            both: 80
        },
        paper: {
            plain: 75,
            sticker: 90,
            tag: 100,
            both: 120
        },
        cloth: {
            plain: 125,
            sticker: 145,
            tag: 155,
            both: 175
        },
        custom_cloth: {
            plain: 199,
            sticker: 225, // custom name + tag is 225, custom name + tag & sticker is 250, let's treat sticker as 225 as well
            tag: 225,
            both: 250
        }
    };

    /* --------------------------------------------------
       2. Event Packages Setup
    -------------------------------------------------- */
    const PACKAGES = {
        custom: {
            name: "Custom Build",
            price: 0,
            included: []
        },
        essential: {
            name: "Essential Package",
            price: 3499,
            included: [
                'inv_dig_1page',
                'board_design_only',
                'brand_sticker_design'
                // plus 3 Social Media Creatives (handled visually)
            ],
            notes: "Includes 3 Social Media Creatives"
        },
        celebration: {
            name: "Celebration Package",
            price: 6999,
            included: [
                'inv_dig_multipage',
                'board_design_print',
                'brand_tag_design',
                'stat_thanks_design'
                // plus 5 Social Media Creatives (handled visually)
            ],
            notes: "Includes 5 Social Media Creatives + Board Print"
        },
        premium: {
            name: "Premium Event Package",
            price: 14999,
            included: [
                'inv_premium_suite',
                'board_design_print_board',
                'board_custom_signage',
                'brand_tag_print',
                'dec_photobooth_design',
                'dec_theme'
                // plus 10 Social Media Creatives and custom stationery
            ],
            notes: "Includes 10 Social Media Creatives & Premium Stationery"
        }
    };

    /* --------------------------------------------------
       3. State Management
    -------------------------------------------------- */
    let state = {
        selectedPackage: 'custom', // 'custom' | 'essential' | 'celebration' | 'premium'
        eventType: '',
        eventTitle: '',
        eventDate: '',
        guests: 100,
        
        includeBags: false,
        bagMaterial: 'paper',
        bagBranding: 'sticker',
        bagQty: 100,
        
        selectedServices: {}, // service_id: { qty: X, checked: bool }
        currentStep: 1
    };

    // Initialize services state with default values
    Object.keys(PRICES).forEach(serviceId => {
        state.selectedServices[serviceId] = {
            checked: false,
            qty: 1
        };
    });

    /* --------------------------------------------------
       4. DOM Selectors
    -------------------------------------------------- */
    const header = document.getElementById('main-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const navLinks = document.querySelectorAll('.nav-link');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    
    // Step panels navigation
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepPanels = document.querySelectorAll('.step-panel');
    
    // Event Details inputs
    const inputEventType = document.getElementById('event-type');
    const inputEventTitle = document.getElementById('event-title');
    const inputEventDate = document.getElementById('event-date');
    const inputGuests = document.getElementById('guest-count');
    
    // Bag builder inputs
    const bagToggle = document.getElementById('include-bags');
    const bagControlsWrapper = document.getElementById('bag-controls-wrapper');
    const selectBagMaterial = document.getElementById('bag-material');
    const selectBagBranding = document.getElementById('bag-branding');
    const inputBagQty = document.getElementById('bag-quantity');
    const btnBagQtyMinus = document.getElementById('bag-qty-minus');
    const btnBagQtyPlus = document.getElementById('bag-qty-plus');
    const labelBagUnitPrice = document.getElementById('bag-unit-price');
    
    // Dynamic services inputs
    const serviceCheckboxes = document.querySelectorAll('.option-row input[type="checkbox"]');
    
    // Sub-quantities
    const chkInvPrint = document.getElementById('chk-inv-print');
    const invPrintQtyWrapper = document.getElementById('inv-print-qty-wrapper');
    const inputInvPrintQty = document.getElementById('inv-print-qty');
    
    const chkRentalBoard = document.getElementById('chk-rental-board');
    const rentalBoardHrsWrapper = document.getElementById('rental-board-hrs-wrapper');
    const inputRentalBoardHrs = document.getElementById('rental-board-hrs');
    
    const chkRentalEasel = document.getElementById('chk-rental-easel');
    const rentalEaselHrsWrapper = document.getElementById('rental-easel-hrs-wrapper');
    const inputRentalEaselHrs = document.getElementById('rental-easel-hrs');
    
    const chkRentalCombo = document.getElementById('chk-rental-combo');
    const rentalComboHrsWrapper = document.getElementById('rental-combo-hrs-wrapper');
    const inputRentalComboHrs = document.getElementById('rental-combo-hrs');

    // Summary Card outputs
    const selectedPackageLabel = document.getElementById('selected-package-label');
    const eventPreviewBar = document.getElementById('event-preview-bar');
    const previewValType = document.getElementById('preview-val-type');
    const previewValGuests = document.getElementById('preview-val-guests');
    const previewValDate = document.getElementById('preview-val-date');
    
    const receiptItemsContainer = document.getElementById('receipt-items-container');
    const billSubtotal = document.getElementById('bill-subtotal');
    const billTotal = document.getElementById('bill-total');
    
    // Action buttons
    const whatsappInquiryBtn = document.getElementById('whatsapp-inquiry-btn');
    const printEstimateBtn = document.getElementById('print-estimate-btn');
    
    // Accordions
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Gallery filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Select package from showcases
    const selectPackageButtons = document.querySelectorAll('.select-package-btn');

    /* --------------------------------------------------
       5. Event Handlers & Core Functions
    -------------------------------------------------- */
    
    // Header Scroll Styling
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        updateActiveNavLink();
    });

    // Active Navigation Highlighting on Scroll
    function updateActiveNavLink() {
        let currentSectionId = 'home';
        const scrollPosition = window.scrollY + 120;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Mobile Hamburger Toggle
    mobileToggle.addEventListener('click', function() {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
            closeMobileDrawer();
        } else {
            openMobileDrawer();
        }
    });

    function openMobileDrawer() {
        mobileDrawer.classList.add('open');
        mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Transform hamburger to X
        mobileToggle.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        mobileToggle.children[1].style.opacity = '0';
        mobileToggle.children[2].style.transform = 'rotate(-45deg) translate(6px, -7px)';
    }

    function closeMobileDrawer() {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
        
        // Transform X back to hamburger
        mobileToggle.children[0].style.transform = '';
        mobileToggle.children[1].style.opacity = '1';
        mobileToggle.children[2].style.transform = '';
    }

    // Close mobile drawer on navigation click
    [...drawerLinks, ...navLinks].forEach(link => {
        link.addEventListener('click', closeMobileDrawer);
    });

    // Gallery Categorization Filter
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });

    // Collapsible Accordion Items
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all items
            accordionHeaders.forEach(h => h.parentElement.classList.remove('active'));
            
            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Stepper wizard navigation
    function setStep(stepNum) {
        state.currentStep = stepNum;
        
        // Update Panel visibility
        stepPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`step-panel-${stepNum}`).classList.add('active');
        
        // Update Step indicators in header
        stepIndicators.forEach(indicator => {
            const indicatorStep = parseInt(indicator.getAttribute('data-step'));
            indicator.classList.remove('active', 'completed');
            
            if (indicatorStep === stepNum) {
                indicator.classList.add('active');
            } else if (indicatorStep < stepNum) {
                indicator.classList.add('completed');
            }
        });
    }

    nextButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            // Basic validation for step 1
            if (nextStep === 2 && !inputEventType.value) {
                inputEventType.reportValidity();
                return;
            }
            setStep(nextStep);
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            setStep(prevStep);
        });
    });

    /* --------------------------------------------------
       6. Calculator Calculations & UI Refresh
    -------------------------------------------------- */
    
    // Checkbox toggles for conditional qty sub-inputs
    function handleSubQtyToggle(checkbox, wrapper, qtyInput, stateId) {
        const isChecked = checkbox.checked;
        wrapper.style.display = isChecked ? 'flex' : 'none';
        state.selectedServices[stateId].checked = isChecked;
        if (isChecked) {
            state.selectedServices[stateId].qty = parseInt(qtyInput.value) || 1;
        }
        calculateReceipt();
    }

    chkInvPrint.addEventListener('change', () => handleSubQtyToggle(chkInvPrint, invPrintQtyWrapper, inputInvPrintQty, 'inv_print'));
    inputInvPrintQty.addEventListener('input', function() {
        state.selectedServices['inv_print'].qty = parseInt(this.value) || 1;
        calculateReceipt();
    });

    chkRentalBoard.addEventListener('change', () => handleSubQtyToggle(chkRentalBoard, rentalBoardHrsWrapper, inputRentalBoardHrs, 'rental_board'));
    inputRentalBoardHrs.addEventListener('input', function() {
        state.selectedServices['rental_board'].qty = parseInt(this.value) || 1;
        calculateReceipt();
    });

    chkRentalEasel.addEventListener('change', () => handleSubQtyToggle(chkRentalEasel, rentalEaselHrsWrapper, inputRentalEaselHrs, 'rental_easel'));
    inputRentalEaselHrs.addEventListener('input', function() {
        state.selectedServices['rental_easel'].qty = parseInt(this.value) || 1;
        calculateReceipt();
    });

    chkRentalCombo.addEventListener('change', () => handleSubQtyToggle(chkRentalCombo, rentalComboHrsWrapper, inputRentalComboHrs, 'rental_combo'));
    inputRentalComboHrs.addEventListener('input', function() {
        state.selectedServices['rental_combo'].qty = parseInt(this.value) || 1;
        calculateReceipt();
    });

    // Standard checkbox listener
    serviceCheckboxes.forEach(chk => {
        const serviceId = chk.getAttribute('data-id');
        if (!serviceId) return; // Skip sub-quantified custom elements
        
        chk.addEventListener('change', function() {
            state.selectedServices[serviceId].checked = this.checked;
            
            // If checking items in custom build, reset base package selection to custom
            if (state.selectedPackage !== 'custom' && !PACKAGES[state.selectedPackage].included.includes(serviceId)) {
                // User is adding custom items on top of package. That's allowed!
            }
            calculateReceipt();
        });
    });

    // Event Info listeners
    inputEventType.addEventListener('change', function() {
        state.eventType = this.value;
        previewValType.innerText = this.value;
        eventPreviewBar.style.display = 'flex';
        calculateReceipt();
    });

    inputEventTitle.addEventListener('input', function() {
        state.eventTitle = this.value;
        calculateReceipt();
    });

    inputEventDate.addEventListener('input', function() {
        state.eventDate = this.value;
        const formattedDate = this.value ? new Date(this.value).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : '-';
        previewValDate.innerText = formattedDate;
        eventPreviewBar.style.display = 'flex';
        calculateReceipt();
    });

    inputGuests.addEventListener('input', function() {
        state.guests = parseInt(this.value) || 100;
        previewValGuests.innerText = state.guests;
        eventPreviewBar.style.display = 'flex';
        calculateReceipt();
    });

    // Return Bag inputs
    bagToggle.addEventListener('change', function() {
        state.includeBags = this.checked;
        bagControlsWrapper.style.opacity = this.checked ? '1' : '0.5';
        bagControlsWrapper.style.pointerEvents = this.checked ? 'all' : 'none';
        calculateReceipt();
    });

    selectBagMaterial.addEventListener('change', function() {
        state.bagMaterial = this.value;
        updateBagUnitPrice();
        calculateReceipt();
    });

    selectBagBranding.addEventListener('change', function() {
        state.bagBranding = this.value;
        updateBagUnitPrice();
        calculateReceipt();
    });

    // Bag quantity increments
    function setBagQty(val) {
        state.bagQty = Math.max(10, Math.min(5000, val));
        inputBagQty.value = state.bagQty;
        calculateReceipt();
    }

    btnBagQtyMinus.addEventListener('click', () => setBagQty(state.bagQty - 10));
    btnBagQtyPlus.addEventListener('click', () => setBagQty(state.bagQty + 10));
    inputBagQty.addEventListener('input', function() {
        setBagQty(parseInt(this.value) || 10);
    });

    function updateBagUnitPrice() {
        const mat = state.bagMaterial;
        const brand = state.bagBranding;
        const unitPrice = BAG_PRICES[mat][brand];
        labelBagUnitPrice.innerText = `₹${unitPrice.toFixed(2)}`;
        return unitPrice;
    }

    // Connect Package Showcase selection buttons
    selectPackageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const pkgId = this.getAttribute('data-package');
            applyPackagePreset(pkgId);
            
            // Visual scroll down to planner
            document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
            
            // Advance step to Step 3 to see services
            setStep(3);
        });
    });

    function applyPackagePreset(pkgId) {
        state.selectedPackage = pkgId;
        const pkg = PACKAGES[pkgId];
        
        // Update Package UI Label
        selectedPackageLabel.innerText = pkg.name;
        
        // Reset check boxes to match package
        serviceCheckboxes.forEach(chk => {
            const serviceId = chk.getAttribute('data-id');
            if (!serviceId) return;
            
            const isIncluded = pkg.included.includes(serviceId);
            chk.checked = isIncluded;
            state.selectedServices[serviceId].checked = isIncluded;
        });

        // Reset subqty checks
        if (pkg.included.includes('inv_print')) {
            chkInvPrint.checked = true;
            invPrintQtyWrapper.style.display = 'flex';
            state.selectedServices['inv_print'].checked = true;
        } else {
            chkInvPrint.checked = false;
            invPrintQtyWrapper.style.display = 'none';
            state.selectedServices['inv_print'].checked = false;
        }
        
        if (pkg.included.includes('rental_board')) {
            chkRentalBoard.checked = true;
            rentalBoardHrsWrapper.style.display = 'flex';
            state.selectedServices['rental_board'].checked = true;
        } else {
            chkRentalBoard.checked = false;
            rentalBoardHrsWrapper.style.display = 'none';
            state.selectedServices['rental_board'].checked = false;
        }

        if (pkg.included.includes('rental_easel')) {
            chkRentalEasel.checked = true;
            rentalEaselHrsWrapper.style.display = 'flex';
            state.selectedServices['rental_easel'].checked = true;
        } else {
            chkRentalEasel.checked = false;
            rentalEaselHrsWrapper.style.display = 'none';
            state.selectedServices['rental_easel'].checked = false;
        }

        if (pkg.included.includes('rental_combo')) {
            chkRentalCombo.checked = true;
            rentalComboHrsWrapper.style.display = 'flex';
            state.selectedServices['rental_combo'].checked = true;
        } else {
            chkRentalCombo.checked = false;
            rentalComboHrsWrapper.style.display = 'none';
            state.selectedServices['rental_combo'].checked = false;
        }

        // Highlight selected card visually
        document.querySelectorAll('.package-card').forEach(card => card.classList.remove('featured'));
        if (pkgId !== 'custom') {
            document.getElementById(`pkg-${pkgId}`).classList.add('featured');
        } else {
            document.getElementById(`pkg-celebration`).classList.add('featured'); // Default styling
        }

        calculateReceipt();
    }

    // core Pricing Math Engine
    function calculateReceipt() {
        let subtotal = 0;
        let finalTotal = 0;
        let lineItemsHTML = '';
        
        const isCustom = state.selectedPackage === 'custom';
        const pkg = PACKAGES[state.selectedPackage];
        
        // 1. Package Pricing base
        if (!isCustom) {
            subtotal += pkg.price;
            lineItemsHTML += `
                <div class="receipt-item-row">
                    <span class="receipt-item-title">${pkg.name} Base Cost</span>
                    <span class="receipt-item-price">₹${pkg.price.toLocaleString('en-IN')}</span>
                </div>
            `;
        }
        
        // 2. Add-on Services calculations
        Object.keys(state.selectedServices).forEach(serviceId => {
            const service = state.selectedServices[serviceId];
            if (service.checked) {
                // If it is covered by the current package, price is 0 (Included)
                const isIncludedInPackage = !isCustom && pkg.included.includes(serviceId);
                
                let price = PRICES[serviceId];
                let itemTotal = price * service.qty;
                
                let title = getServiceDisplayName(serviceId);
                if (service.qty > 1) {
                    if (serviceId === 'inv_print') {
                        title += ` (${service.qty} pages)`;
                    } else if (serviceId.includes('rental_')) {
                        title += ` (${service.qty} hrs)`;
                    } else {
                        title += ` (Qty: ${service.qty})`;
                    }
                }
                
                if (isIncludedInPackage) {
                    lineItemsHTML += `
                        <div class="receipt-item-row">
                            <span class="receipt-item-title">${title}</span>
                            <span class="receipt-item-price" style="color:var(--color-primary); font-size:0.8rem;">Included</span>
                        </div>
                    `;
                } else {
                    subtotal += itemTotal;
                    lineItemsHTML += `
                        <div class="receipt-item-row">
                            <span class="receipt-item-title">${title}</span>
                            <span class="receipt-item-price">₹${itemTotal.toLocaleString('en-IN')}</span>
                        </div>
                    `;
                }
            }
        });
        
        // 3. Return Bags calculation
        if (state.includeBags) {
            const unitPrice = updateBagUnitPrice();
            const bagTotal = unitPrice * state.bagQty;
            subtotal += bagTotal;
            
            const bagTitle = `${getBagMaterialLabel(state.bagMaterial)} (${getBagBrandingLabel(state.bagBranding)}) x ${state.bagQty}`;
            lineItemsHTML += `
                <div class="receipt-item-row">
                    <span class="receipt-item-title">${bagTitle}</span>
                    <span class="receipt-item-price">₹${bagTotal.toLocaleString('en-IN')}</span>
                </div>
            `;
        }

        // Render line items
        if (lineItemsHTML === '') {
            receiptItemsContainer.innerHTML = '<p class="text-center text-muted" style="padding: 20px 0;">No items selected yet. Choose a package above or start adding items.</p>';
        } else {
            receiptItemsContainer.innerHTML = lineItemsHTML;
        }

        // Update totals displays
        billSubtotal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
        billTotal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
        
        // Apply minimum project value notice if below ₹500
        if (subtotal > 0 && subtotal < 500) {
            billTotal.innerHTML = `₹${subtotal.toLocaleString('en-IN')} <small style="display:block; font-size:0.7rem; color:var(--color-secondary); font-weight:300;">* Min. Project value of ₹500 applies</small>`;
        }
    }

    // Helper text formatting functions
    function getServiceDisplayName(id) {
        const names = {
            inv_dig_1page: "Digital Invitation (1 Page)",
            inv_dig_multipage: "Digital Invitation (Multi-Page)",
            inv_premium_suite: "Premium Invitation Suite",
            inv_video: "Video Invitation Design",
            inv_print: "Invitation Printing",
            
            board_design_only: "Welcome Board Design Only",
            board_design_print: "Welcome Board Design + Print",
            board_design_print_board: "Welcome Board Design + Print + Board",
            board_custom_signage: "Custom Event Signage",
            
            rental_board: "Board Rental",
            rental_easel: "Wooden Easel Stand Rental",
            rental_combo: "Board + Stand Rental Combo",
            rental_setup: "Display Setup & Arrangement",
            
            dig_custom_event: "Custom Digital Design (For Any Event)",
            dig_wa_creative: "WhatsApp Invitation Creative",
            dig_wa_pkg: "WhatsApp Package (3 Variations)",
            dig_ig_story: "Instagram Story Design",
            dig_ig_post: "Instagram Post Design",
            dig_countdown: "Event Countdown Post",
            dig_highlight: "Event Highlight Creative",
            dig_thank_you: "Thank You Social Media Post",
            dig_announcement: "Event Announcement Creative",
            dig_save_date: "Save The Date Design",
            dig_reminder: "Event Reminder Creative",
            dig_pkg_5: "Social Media Package (5 Creatives)",
            dig_pkg_10: "Social Media Package (10 Creatives)",
            
            brand_tag_design: "Return Gift Tags (Design Only)",
            brand_tag_print: "Return Gift Tags (Design + Print)",
            brand_sticker_design: "Custom Stickers (Design Only)",
            brand_sticker_print: "Custom Stickers (Design + Print)",
            brand_bag_sticker_design: "Return Bag Stickers (Design Only)",
            brand_bag_sticker_print: "Return Bag Stickers (Design + Print)",
            
            acc_choco_design: "Chocolate Wrapper (Design Only)",
            acc_choco_print: "Chocolate Wrapper (Design + Print)",
            acc_bottle_design: "Water Bottle Label (Design Only)",
            acc_bottle_print: "Water Bottle Label (Design + Print)",
            acc_cupcake_design: "Cupcake Toppers / Food Tags (Design Only)",
            acc_cupcake_print: "Cupcake Toppers / Food Tags (Design + Print)",
            acc_box_sticker_design: "Gift Box Sticker (Design Only)",
            acc_box_sticker_print: "Gift Box Sticker (Design + Print)",
            acc_envelope_design: "Envelope Seals & Stickers (Design Only)",
            acc_envelope_print: "Envelope Seals & Stickers (Design + Print)",
            
            stat_thanks_design: "Thank You Card (Design Only)",
            stat_thanks_print: "Thank You Card (Design + Print)",
            stat_menu_design: "Menu Card (Design Only)",
            stat_menu_print: "Menu Card (Design + Print)",
            stat_table_design: "Table Card / Tent Card (Design Only)",
            stat_table_print: "Table Card / Tent Card (Design + Print)",
            stat_place_design: "Place Card / Guest Name Card (Design Only)",
            stat_place_print: "Place Card / Guest Name Card (Design + Print)",
            stat_note_design: "Welcome Note (Design Only)",
            stat_note_print: "Welcome Note (Design + Print)",
            stat_schedule_design: "Event Schedule (Design Only)",
            stat_schedule_print: "Event Schedule (Design + Print)",
            stat_seating_design: "Seating Chart (Design Only)",
            stat_seating_print: "Seating Chart (Design + Print)",
            
            dec_photobooth_design: "Photo Booth Frame (Design Only)",
            dec_photobooth_print: "Photo Booth Frame (Design + Print)",
            dec_backdrop: "Backdrop Design Artwork",
            dec_stage: "Stage Branding Design",
            dec_theme: "Theme-Based Event Branding"
        };
        return names[id] || id;
    }

    function getBagMaterialLabel(val) {
        const labels = {
            plastic: "Plastic Return Bags",
            paper: "Premium Paper Return Bags",
            cloth: "Premium Cloth Return Bags",
            custom_cloth: "Custom Printed Cloth Bags"
        };
        return labels[val] || val;
    }

    function getBagBrandingLabel(val) {
        const labels = {
            plain: "Plain / No Sticker",
            sticker: "With Sticker",
            tag: "With Custom Tag",
            both: "With Tag & Sticker"
        };
        return labels[val] || val;
    }

    /* --------------------------------------------------
       7. WhatsApp Inquiry & Print Integration
    -------------------------------------------------- */
    whatsappInquiryBtn.addEventListener('click', function() {
        // Collect form data
        const eventType = state.eventType || "Event";
        const title = state.eventTitle ? `"${state.eventTitle}"` : "My Event";
        const date = state.eventDate ? ` on ${new Date(state.eventDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}` : "";
        const guests = state.guests;
        
        let message = `*EventCraft Inquiry* 📩\n`;
        message += `Hello! I would like to get a quote for my upcoming event:\n\n`;
        message += `• *Event Type:* ${eventType}\n`;
        message += `• *Title:* ${title}\n`;
        message += `• *Date:* ${date}\n`;
        message += `• *Expected Guests:* ${guests}\n`;
        message += `• *Selected Package:* ${PACKAGES[state.selectedPackage].name}\n\n`;
        
        message += `*Selected Services & Customizations:*\n`;
        
        let total = 0;
        const isCustom = state.selectedPackage === 'custom';
        const pkg = PACKAGES[state.selectedPackage];

        if (!isCustom) {
            total += pkg.price;
            message += `- ${pkg.name} (Base): ₹${pkg.price.toLocaleString('en-IN')}\n`;
        }

        Object.keys(state.selectedServices).forEach(serviceId => {
            const service = state.selectedServices[serviceId];
            if (service.checked) {
                const isIncluded = !isCustom && pkg.included.includes(serviceId);
                let price = PRICES[serviceId];
                let itemTotal = price * service.qty;
                
                let name = getServiceDisplayName(serviceId);
                if (service.qty > 1) {
                    name += ` (Qty: ${service.qty})`;
                }
                
                if (isIncluded) {
                    message += `- ${name}: _Included in package_\n`;
                } else {
                    total += itemTotal;
                    message += `- ${name}: ₹${itemTotal.toLocaleString('en-IN')}\n`;
                }
            }
        });

        if (state.includeBags) {
            const unitPrice = updateBagUnitPrice();
            const bagTotal = unitPrice * state.bagQty;
            total += bagTotal;
            const bagName = `${getBagMaterialLabel(state.bagMaterial)} (${getBagBrandingLabel(state.bagBranding)}) x ${state.bagQty}`;
            message += `- ${bagName}: ₹${bagTotal.toLocaleString('en-IN')}\n`;
        }

        message += `\n*Estimated Total: ₹${total.toLocaleString('en-IN')}*\n\n`;
        message += `Please review and let me know the feasibility and final pricing. Thank you!`;
        
        // Encode message
        const encodedText = encodeURIComponent(message);
        
        // Open WhatsApp link (using placeholder contact number +919010476704)
        const whatsappNumber = "9010476704"
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
        
        window.open(whatsappURL, '_blank');
    });

    // Print receipt
    printEstimateBtn.addEventListener('click', function() {
        window.print();
    });

    /* --------------------------------------------------
       8. Pricing Catalog Interactive Integration
    -------------------------------------------------- */
    const pricingTabBtns = document.querySelectorAll('.pricing-tab-btn');
    const pricingTabPanels = document.querySelectorAll('.pricing-tab-panel');

    pricingTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            pricingTabBtns.forEach(b => b.classList.remove('active'));
            pricingTabPanels.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            const activePanel = document.getElementById(`tab-${tabId}`);
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
    });

    // Add to Planner from Pricing Catalog
    const priceCtas = document.querySelectorAll('.price-cta');
    priceCtas.forEach(cta => {
        cta.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceId = this.getAttribute('data-id');
            if (!serviceId) return;

            const chk = document.querySelector(`.step-panel input[type="checkbox"][data-id="${serviceId}"]`);
            if (chk) {
                // Check it
                chk.checked = true;
                chk.dispatchEvent(new Event('change'));

                // Find parent accordion-item and expand it
                const accordionItem = chk.closest('.accordion-item');
                if (accordionItem) {
                    // Close other accordions
                    document.querySelectorAll('.services-accordion .accordion-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    accordionItem.classList.add('active');
                }

                // Advance step to Step 3 to see services
                setStep(3);
                
                // Scroll to planner
                document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });

                // Show Toast Notification
                const displayName = getServiceDisplayName(serviceId);
                showToast(`✨ Added <strong>${displayName}</strong> to your Budget Planner!`);
            }
        });
    });

    // Bags Direct Link CTA
    const goToBagsBtn = document.getElementById('pricing-go-to-bags');
    if (goToBagsBtn) {
        goToBagsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Turn on the bags checkbox
            const bagToggle = document.getElementById('include-bags');
            if (bagToggle) {
                bagToggle.checked = true;
                bagToggle.dispatchEvent(new Event('change'));
            }
            
            // Go to Step 2 (Return Gifts)
            setStep(2);
            
            // Scroll to planner
            document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
            
            showToast("🎁 Return Gift Bags configuration opened!");
        });
    }

    // Toast Notification System
    function showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        container.appendChild(toast);
        
        // Trigger reflow to apply transition
        toast.offsetHeight;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            });
        }, 3000);
    }

    // Initialize display with calculations
    calculateReceipt();
});
