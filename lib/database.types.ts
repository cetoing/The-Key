export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          course: string;
          university: string;
          skills: string[];
          bio: string;
          font_size: string;
          high_contrast: boolean;
          reduced_motion: boolean;
          theme: string;
          color_palette: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string;
          course?: string;
          university?: string;
          skills?: string[];
          bio?: string;
          font_size?: string;
          high_contrast?: boolean;
          reduced_motion?: boolean;
          theme?: string;
          color_palette?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          course?: string;
          university?: string;
          skills?: string[];
          bio?: string;
          font_size?: string;
          high_contrast?: boolean;
          reduced_motion?: boolean;
          theme?: string;
          color_palette?: string;
          updated_at?: string;
        };
      };
      cv_items: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          organisation: string;
          start_date: string;
          end_date: string;
          description: string;
          is_current: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          title?: string;
          organisation?: string;
          start_date?: string;
          end_date?: string;
          description?: string;
          is_current?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          organisation?: string;
          start_date?: string;
          end_date?: string;
          description?: string;
          is_current?: boolean;
          order_index?: number;
          updated_at?: string;
        };
      };
      generated_cvs: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          status: string;
          prompt_used: string;
          model_used: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string;
          status?: string;
          prompt_used?: string;
          model_used?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          status?: string;
          prompt_used?: string;
          model_used?: string;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          internship_id: string;
          internship_title: string;
          company: string;
          match_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          internship_id: string;
          internship_title?: string;
          company?: string;
          match_percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          internship_id?: string;
          internship_title?: string;
          company?: string;
          match_percentage?: number;
        };
      };
    };
  };
};
